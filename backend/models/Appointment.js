
const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  patientEmail: {
    type: String,
    required: true
  },
  patientPhone: {
    type: String,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'booked', 'approved', 'paid', 'unpaid', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'refund_pending', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['online', 'offline', 'card', 'gpay', 'paytm', 'phonepe', null],
    default: null
  },
  amount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Populate doctor details when fetching appointments
AppointmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'doctorId',
    select: 'user specialty image',
    populate: {
      path: 'user',
      select: 'name email'
    }
  });
  
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
