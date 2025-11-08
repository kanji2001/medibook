
const express = require('express');
const router = express.Router();
const { 
  createAppointment,
  getUserAppointments,
  getDoctorAppointments,
  updateAppointmentStatus,
  getAppointment,
  processPayment,
  getPaymentStatus
} = require('../controllers/appointments');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/', createAppointment);
router.get('/user', getUserAppointments);
router.get('/doctor', authorize('doctor'), getDoctorAppointments);
router.get('/:id', getAppointment);
router.put('/status/:id', authorize('doctor'), updateAppointmentStatus);
router.post('/:id/pay', processPayment);
router.get('/:id/payment-status', getPaymentStatus);

module.exports = router;
