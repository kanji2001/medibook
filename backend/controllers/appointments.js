
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Payment = require('../models/Payment');
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Helper function to send email with appointment details
const sendAppointmentEmail = async (appointment, isPaid) => {
  try {
    // In a real implementation, this would use environment variables
    const transporter = nodemailer.createTransport({
      host: 'smtp.example.com',
      port: 587,
      secure: false,
      auth: {
        user: 'appointments@example.com',
        pass: 'password123'
      }
    });
    
    // Create PDF appointment slip
    const pdfPath = path.join(__dirname, '../temp', `appointment_${appointment._id}.pdf`);
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(pdfPath);
    
    doc.pipe(writeStream);
    
    // Add content to PDF
    doc.fontSize(25).text('Appointment Confirmation', {
      align: 'center'
    });
    
    doc.moveDown();
    doc.fontSize(14).text(`Patient: ${appointment.patientName}`);
    doc.fontSize(14).text(`Date: ${appointment.date}`);
    doc.fontSize(14).text(`Time: ${appointment.time}`);
    doc.fontSize(14).text(`Doctor: ${appointment.doctorName || 'Doctor'}`);
    doc.fontSize(14).text(`Reason: ${appointment.reason}`);
    
    if (isPaid) {
      doc.moveDown();
      doc.fontSize(16).text('Payment Information', {
        underline: true
      });
      doc.fontSize(14).text(`Payment Status: Paid`);
      doc.fontSize(14).text(`Payment Method: ${appointment.paymentMethod}`);
      doc.fontSize(14).text(`Amount: $${(appointment.amount / 100).toFixed(2)}`);
    }
    
    doc.end();
    
    // Wait for PDF creation to complete
    await new Promise(resolve => writeStream.on('finish', resolve));
    
    // Send email
    const mailOptions = {
      from: 'appointments@example.com',
      to: appointment.patientEmail,
      subject: 'Your Appointment Confirmation',
      text: `Thank you for booking an appointment with us. Your appointment is on ${appointment.date} at ${appointment.time}.`,
      attachments: [{
        filename: 'appointment_slip.pdf',
        path: pdfPath
      }]
    };
    
    await transporter.sendMail(mailOptions);
    
    // Delete temporary file
    fs.unlinkSync(pdfPath);
    
  } catch (error) {
    console.error('Error sending appointment email:', error);
  }
};

// @desc    Create new appointment
// @route   POST /api/appointments
// @access  Private
exports.createAppointment = async (req, res, next) => {
  try {
    const {
      doctorId,
      date,
      time,
      patientName,
      patientEmail,
      patientPhone,
      reason,
      notes
    } = req.body;

    // Check if the appointment slot is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Check if the time slot is already booked
    const existingAppointment = await Appointment.findOne({
      doctorId,
      date,
      time,
      status: { $nin: ['cancelled'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment with "booked" status (payment required)
    const appointment = await Appointment.create({
      doctorId,
      userId: req.user.id,
      patientName,
      patientEmail,
      patientPhone,
      date,
      time,
      reason,
      notes,
      status: 'booked',
      paymentStatus: 'pending'
    });

    // Add doctor details to the response
    const doctorName = doctor.user ? doctor.user.name : 'Doctor';
    const formattedAppointment = {
      id: appointment._id,
      doctorId: doctor._id,
      userId: req.user.id,
      patientName: appointment.patientName,
      doctorName: doctorName,
      doctorSpecialty: doctor.specialty,
      doctorImage: doctor.image,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      reason: appointment.reason
    };

    res.status(201).json({
      success: true,
      data: formattedAppointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user appointments
// @route   GET /api/appointments/user
// @access  Private
exports.getUserAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find({ userId: req.user.id })
      .populate({
        path: 'doctorId',
        select: 'specialty image',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ date: 1, time: 1 });

    // Format for frontend
    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      doctorId: apt.doctorId._id,
      userId: apt.userId,
      patientName: apt.patientName,
      doctorName: apt.doctorId.user ? apt.doctorId.user.name : 'Doctor',
      doctorSpecialty: apt.doctorId.specialty,
      doctorImage: apt.doctorId.image,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt,
      paymentMethod: apt.paymentMethod,
      paymentStatus: apt.paymentStatus,
      amount: apt.amount
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor appointments
// @route   GET /api/appointments/doctor
// @access  Private (Doctor only)
exports.getDoctorAppointments = async (req, res, next) => {
  try {
    // Find doctor ID from user ID
    const doctor = await Doctor.findOne({ user: req.user.id });
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    // Only show appointments assigned to this doctor
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .sort({ date: 1, time: 1 });
    
    // Format for frontend
    const formattedAppointments = appointments.map(apt => ({
      id: apt._id,
      doctorId: apt.doctorId,
      userId: apt.userId,
      patientName: apt.patientName,
      date: apt.date,
      time: apt.time,
      status: apt.status,
      notes: apt.notes,
      createdAt: apt.createdAt,
      patientEmail: apt.patientEmail,
      patientPhone: apt.patientPhone,
      reason: apt.reason
    }));

    res.status(200).json(formattedAppointments);
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status (approve/reject)
// @route   PATCH /api/appointments/:id/status
// @access  Private (Doctor only)
exports.updateAppointmentStatus = async (req, res, next) => {
  console.log("updateAppointmentStatus called with req.params:", req.params, "and req.body:", req.body);
  try {
    const { status } = req.body;
    console.log("Requested status:", status);

    if (!['pending', 'approved', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      console.log("Invalid status:", status);
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    console.log("Finding appointment by ID:", req.params.id);
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'doctorId',
      select: 'user specialty'
    });
    console.log("Appointment found:", appointment);

    if (!appointment) {
      console.log("Appointment not found for ID:", req.params.id);
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    console.log("Finding doctor with user ID:", req.user.id);
    const doctor = await Doctor.findOne({ user: req.user.id });
    console.log("Doctor found:", doctor);

    if (!doctor || appointment.doctorId._id.toString() !== doctor._id.toString()) {
      console.log("Unauthorized access. Doctor:", doctor, "Appointment Doctor ID:", appointment.doctorId._id.toString(), "Doctor ID:", doctor?._id.toString());
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this appointment. Only the assigned doctor can approve or reject it.'
      });
    }

    // Handle rejection with refund logic for paid appointments
    if (status === 'cancelled' && appointment.paymentStatus === 'completed') {
      console.log("Processing refund for cancelled appointment");
      
      try {
        // Find the payment record
        const payment = await Payment.findOne({ 
          appointmentId: appointment._id,
          status: 'completed'
        });

        if (payment && payment.razorpayPaymentId) {
          // Process refund via Razorpay
          const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
            amount: payment.amount,
            speed: 'normal',
            notes: {
              reason: 'Doctor rejected appointment',
              appointmentId: appointment._id.toString()
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

          console.log("Refund processed successfully:", refund);
          
          return res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled and refund processed. Amount will be credited within 24-48 hours.'
          });
        } else {
          // No payment found or payment ID missing
          appointment.status = status;
          await appointment.save();
          
          return res.status(200).json({
            success: true,
            data: appointment,
            message: 'Appointment cancelled.'
          });
        }
      } catch (refundError) {
        console.error("Refund processing error:", refundError);
        
        // Update appointment status even if refund fails
        appointment.status = 'cancelled';
        appointment.paymentStatus = 'refund_pending';
        await appointment.save();
        
        return res.status(200).json({
          success: true,
          data: appointment,
          message: 'Appointment cancelled. Refund processing failed - please contact support.'
        });
      }
    }

    console.log("Updating appointment status to:", status);
    appointment.status = status;
    await appointment.save();
    console.log("Appointment updated:", appointment);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error("Error in updateAppointmentStatus:", error);
    next(error);
  }
};

// @desc    Process payment for an appointment
// @route   POST /api/appointments/:id/pay
// @access  Private (Patient only)
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod } = req.body;
    const appointmentId = req.params.id;
    
    if (!['online', 'offline', 'gpay', 'paytm', 'phonepe', 'card'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method'
      });
    }
    
    const appointment = await Appointment.findById(appointmentId).populate({
      path: 'doctorId',
      select: 'user specialty',
      populate: { path: 'user', select: 'name' }
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this appointment'
      });
    }
    
    // Set standard consultation fee
    const amount = 4999; // $49.99
    
    // Update appointment with payment
    appointment.paymentMethod = paymentMethod;
    appointment.amount = amount;
    appointment.paymentStatus = 'completed';
    appointment.status = 'confirmed'; // Automatically confirm after payment
    
    await appointment.save();
    
    // Send email with payment confirmation
    await sendAppointmentEmail(appointment, true);
    
    res.status(200).json({
      success: true,
      data: {
        id: appointment._id,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        amount: appointment.amount
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointment by ID
// @route   GET /api/appointments/:id
// @access  Private
exports.getAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate({
        path: 'doctorId',
        select: 'specialty image',
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

    // Security check - only allow the patient, the assigned doctor, or admin to view
    const doctor = await Doctor.findOne({ user: req.user.id });
    const isAssignedDoctor = doctor && doctor._id.toString() === appointment.doctorId._id.toString();
    const isPatient = appointment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    if (!isAssignedDoctor && !isPatient && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this appointment'
      });
    }

    // Format the response
    const formattedAppointment = {
      id: appointment._id,
      doctorId: appointment.doctorId._id,
      userId: appointment.userId,
      patientName: appointment.patientName,
      patientEmail: appointment.patientEmail,
      patientPhone: appointment.patientPhone,
      date: appointment.date,
      time: appointment.time,
      reason: appointment.reason,
      notes: appointment.notes,
      status: appointment.status,
      paymentStatus: appointment.paymentStatus,
      paymentMethod: appointment.paymentMethod,
      amount: appointment.amount,
      createdAt: appointment.createdAt,
      doctorName: appointment.doctorId.user ? appointment.doctorId.user.name : 'Doctor',
      doctorSpecialty: appointment.doctorId.specialty,
      doctorImage: appointment.doctorId.image
    };

    res.status(200).json({
      success: true,
      data: formattedAppointment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status of an appointment
// @route   GET /api/appointments/:id/payment-status
// @access  Private
exports.getPaymentStatus = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    if (appointment.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to check payment status for this appointment'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        amount: appointment.amount
      }
    });
  } catch (error) {
    next(error);
  }
};
