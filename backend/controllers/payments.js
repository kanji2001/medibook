
const Appointment = require('../models/Appointment');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// @desc    Create payment order
// @route   POST /api/payments/create
// @access  Private
exports.createPayment = async (req, res, next) => {
  try {
    const { appointmentId, paymentMethod } = req.body;

    const appointment = await Appointment.findById(appointmentId)
      .populate({
        path: 'doctorId',
        select: 'specialty',
        populate: {
          path: 'user',
          select: 'name'
        }
      });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is authorized for this appointment
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false, 
        message: 'Not authorized to make payment for this appointment'
      });
    }

    // Set standard consultation fee
    const amount = 4999; // $49.99 in paise (₹49.99)

    if (paymentMethod === 'offline') {
      // Create a payment record for offline payment
      const payment = await Payment.create({
        appointmentId,
        userId: req.user.id,
        amount,
        method: 'offline',
        status: 'pending'
      });

      // Update appointment status
      appointment.status = 'unpaid';
      appointment.paymentMethod = 'offline';
      appointment.paymentStatus = 'pending';
      appointment.amount = amount;
      await appointment.save();

      return res.status(200).json({
        success: true,
        data: {
          paymentId: payment._id,
          method: 'offline',
          status: 'pending'
        }
      });
    } else {
      // Online payment via Razorpay
      const order = await razorpay.orders.create({
        amount: amount, // Amount in paise
        currency: 'INR',
        receipt: `receipt_${appointmentId}`,
        notes: {
          appointmentId: appointmentId,
          doctorName: appointment.doctorId.user.name,
          patientName: appointment.patientName
        }
      });

      // Create payment record
      const payment = await Payment.create({
        appointmentId,
        userId: req.user.id,
        amount,
        method: 'razorpay',
        status: 'pending',
        razorpayOrderId: order.id
      });

      // Update appointment
      appointment.paymentMethod = 'online';
      appointment.paymentStatus = 'pending';
      appointment.amount = amount;
      await appointment.save();

      res.status(200).json({
        success: true,
        data: {
          orderId: order.id,
          amount: order.amount,
          currency: order.currency,
          paymentId: payment._id,
          key: process.env.RAZORPAY_KEY_ID
        }
      });
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    next(error);
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
exports.verifyPayment = async (req, res, next) => {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      appointmentId 
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    // Find payment by Razorpay order ID
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Update payment status
    payment.status = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    await payment.save();

    // Update appointment status
    const appointment = await Appointment.findById(appointmentId);
    if (appointment) {
      appointment.status = 'confirmed';
      appointment.paymentStatus = 'completed';
      await appointment.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        status: 'completed',
        appointment: appointment,
        paymentId: razorpay_payment_id
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    next(error);
  }
};

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private
exports.processRefund = async (req, res, next) => {
  try {
    const { appointmentId } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const payment = await Payment.findOne({ 
      appointmentId: appointmentId,
      status: 'completed'
    });

    if (!payment || !payment.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'No completed payment found for this appointment'
      });
    }

    // Create refund via Razorpay
    const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
      amount: payment.amount, // Full refund
      speed: 'normal',
      notes: {
        reason: 'Doctor rejected appointment',
        appointmentId: appointmentId
      }
    });

    // Update payment record
    payment.refundId = refund.id;
    payment.refundStatus = 'processed';
    payment.refundAmount = refund.amount;
    await payment.save();

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.paymentStatus = 'refunded';
    await appointment.save();

    res.status(200).json({
      success: true,
      data: {
        refundId: refund.id,
        amount: refund.amount,
        status: refund.status,
        message: 'Refund processed successfully. Amount will be credited within 24-48 hours.'
      }
    });
  } catch (error) {
    console.error('Refund error:', error);
    next(error);
  }
};
