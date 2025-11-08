
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

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
    
    // Ensure temp directory exists
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Create PDF appointment slip
    const pdfPath = path.join(tempDir, `appointment_${appointment._id}.pdf`);
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

    // Handle cancellation for paid appointments
    if (status === 'cancelled' && appointment.paymentStatus === 'completed') {
      appointment.status = 'cancelled';
      appointment.paymentStatus = 'refund_pending';
      await appointment.save();

      return res.status(200).json({
        success: true,
        data: appointment,
        message: 'Appointment cancelled. Refund will be processed manually by our support team.'
      });
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

const ONLINE_PAYMENT_METHODS = new Set(['online', 'gpay', 'paytm', 'phonepe', 'card']);

// @desc    Process payment for an appointment
// @route   POST /api/appointments/:id/pay
// @access  Private (Patient only)
exports.processPayment = async (req, res, next) => {
  try {
    const { paymentMethod, amount, currency, razorpay, verification, order } = req.body;
    const appointmentId = req.params.id;

    if (!['online', 'offline', 'gpay', 'paytm', 'phonepe', 'card'].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment method',
      });
    }

    const appointment = await Appointment.findById(appointmentId).populate({
      path: 'doctorId',
      select: 'user specialty location',
      populate: { path: 'user', select: 'name email' },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    // Check if the appointment belongs to the user
    if (appointment.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to process payment for this appointment',
      });
    }

    const now = new Date();
    const normalizedAmount = Number.isFinite(Number(amount)) ? Number(amount) : appointment.amount || 4999;
    const normalizedCurrency = typeof currency === 'string' && currency.trim() ? currency.trim().toUpperCase() : 'INR';
    const isOnlinePayment = ONLINE_PAYMENT_METHODS.has(paymentMethod);

    if (isOnlinePayment) {
      if (!razorpay?.paymentId || !razorpay?.orderId || !razorpay?.signature) {
        return res.status(400).json({
          success: false,
          message: 'Missing Razorpay payment details.',
        });
      }

      appointment.paymentGateway = 'razorpay';
      appointment.paymentStatus = 'completed';
      appointment.status = 'confirmed';
      appointment.amount = normalizedAmount;
      appointment.paymentMethod = paymentMethod;
      appointment.razorpayOrderId = razorpay.orderId;
      appointment.razorpayPaymentId = razorpay.paymentId;
      appointment.razorpaySignature = razorpay.signature;
      appointment.paymentInitiatedAt = appointment.paymentInitiatedAt || now;
      appointment.paymentCapturedAt = now;
      appointment.paymentMeta = {
        ...(appointment.paymentMeta || {}),
        razorpay: {
          ...(appointment.paymentMeta?.razorpay || {}),
          order,
          currency: normalizedCurrency,
          ...razorpay,
        },
        verification,
      };
    } else if (paymentMethod === 'offline') {
      appointment.paymentGateway = null;
      appointment.paymentStatus = 'pending';
      appointment.status = 'booked';
      appointment.amount = normalizedAmount;
      appointment.paymentMethod = paymentMethod;
      appointment.paymentInitiatedAt = appointment.paymentInitiatedAt || now;
    } else {
      appointment.paymentGateway = null;
      appointment.paymentStatus = 'completed';
      appointment.status = 'confirmed';
      appointment.amount = normalizedAmount;
      appointment.paymentMethod = paymentMethod;
      appointment.paymentCapturedAt = now;
    }

    await appointment.save();

    // Send email with payment confirmation (includes receipt PDF when paid)
    await sendAppointmentEmail(appointment, appointment.paymentStatus === 'completed');

    res.status(200).json({
      success: true,
      data: {
        id: appointment._id,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        paymentMethod: appointment.paymentMethod,
        amount: appointment.amount,
        paymentGateway: appointment.paymentGateway,
        razorpayOrderId: appointment.razorpayOrderId,
        razorpayPaymentId: appointment.razorpayPaymentId,
        receiptAvailable: appointment.paymentStatus === 'completed',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download payment receipt for an appointment
// @route   GET /api/appointments/:id/receipt
// @access  Private
exports.downloadPaymentReceipt = async (req, res, next) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate({
      path: 'doctorId',
      select: 'specialty location user',
      populate: { path: 'user', select: 'name email' },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }

    const isOwner = appointment.userId.toString() === req.user.id;
    const isDoctor = appointment.doctorId?.user?._id?.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to download this receipt.',
      });
    }

    if (appointment.paymentStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment has not been completed for this appointment.',
      });
    }

    const inline = req.query.inline === 'true';
    const doc = new PDFDocument({ margin: 50 });
    const filename = `appointment_${appointment._id}_receipt.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${filename}"`);

    doc.pipe(res);

    const primaryColor = '#2563EB';
    const darkColor = '#1F2937';
    const mutedColor = '#6B7280';
    const currencyCode = appointment.paymentMeta?.razorpay?.currency || 'INR';

    const formatDateTime = value => {
      if (!value) return 'N/A';
      return new Date(value).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    };

    const formatCurrency = valueInPaise => {
      const numericValue = Number.isFinite(Number(valueInPaise)) ? Number(valueInPaise) / 100 : 0;
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currencyCode,
        minimumFractionDigits: 2,
      }).format(numericValue);
    };

    const addSection = (title, rows) => {
      doc.moveDown(1);
      doc
        .font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(primaryColor)
        .text(title.toUpperCase());
      doc.moveDown(0.35);
      rows.forEach(({ label, value }) => {
        doc
          .font('Helvetica-Bold')
          .fontSize(11)
          .fillColor(darkColor)
          .text(`${label}: `, { continued: true });
        doc
          .font('Helvetica')
          .fontSize(11.5)
          .fillColor('#111827')
          .text(value || 'N/A');
      });
    };

    doc
      .font('Helvetica-Bold')
      .fontSize(20)
      .fillColor(primaryColor)
      .text('Health Scheduling Hub', { align: 'center' });

    doc
      .moveDown(0.2)
      .font('Helvetica-Bold')
      .fontSize(16)
      .fillColor(darkColor)
      .text('Payment Receipt', { align: 'center' });

    doc
      .moveDown(0.4)
      .lineWidth(2)
      .strokeColor(primaryColor)
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();

    doc.moveDown(0.6);
    doc
      .font('Helvetica')
      .fontSize(11)
      .fillColor(mutedColor)
      .text(`Receipt Generated: ${formatDateTime(new Date())}`);

    addSection('Invoice Details', [
      { label: 'Appointment ID', value: appointment._id.toString() },
      { label: 'Payment Status', value: appointment.paymentStatus },
      { label: 'Payment Method', value: appointment.paymentMethod || 'N/A' },
      { label: 'Payment Gateway', value: appointment.paymentGateway || 'N/A' },
      { label: 'Payment Captured At', value: formatDateTime(appointment.paymentCapturedAt) },
    ]);

    addSection('Patient Details', [
      { label: 'Name', value: appointment.patientName },
      { label: 'Email', value: appointment.patientEmail },
      { label: 'Phone', value: appointment.patientPhone },
    ]);

    addSection('Doctor Details', [
      { label: 'Doctor', value: appointment.doctorId?.user?.name || 'N/A' },
      { label: 'Specialty', value: appointment.doctorId?.specialty || 'N/A' },
      { label: 'Location', value: appointment.doctorId?.location || 'N/A' },
    ]);

    addSection('Appointment Details', [
      { label: 'Date', value: appointment.date },
      { label: 'Time', value: appointment.time },
      { label: 'Reason', value: appointment.reason },
    ]);

    doc.moveDown(1);
    doc
      .rect(doc.page.margins.left, doc.y, doc.page.width - doc.page.margins.left - doc.page.margins.right, 70)
      .fillOpacity(0.08)
      .fill(primaryColor)
      .fillOpacity(1);

    const summaryTop = doc.y + 10;
    doc
      .font('Helvetica-Bold')
      .fontSize(13)
      .fillColor(primaryColor)
      .text('PAYMENT SUMMARY', doc.page.margins.left + 12, summaryTop);

    doc
      .font('Helvetica')
      .fontSize(12)
      .fillColor(darkColor)
      .text(`Amount Paid: ${formatCurrency(appointment.amount)}`, {
        align: 'left',
        indent: 12,
      });
    doc.text(`Currency: ${currencyCode}`, { indent: 12 });
    if (appointment.razorpayOrderId) {
      doc.text(`Razorpay Order ID: ${appointment.razorpayOrderId}`, { indent: 12 });
    }
    if (appointment.razorpayPaymentId) {
      doc.text(`Razorpay Payment ID: ${appointment.razorpayPaymentId}`, { indent: 12 });
    }
    doc.moveDown(1.5);

    doc
      .font('Helvetica')
      .fontSize(10.5)
      .fillColor(mutedColor)
      .text(
        'This is a system-generated receipt. For any queries regarding your payment, please contact support@healthschedulinghub.com.',
        {
          align: 'center',
        }
      );

    doc.end();
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
