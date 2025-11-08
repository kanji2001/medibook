
const express = require('express');
const router = express.Router();
const { 
  getDoctors,
  getDoctor,
  updateAvailability,
  getDoctorAvailability
} = require('../controllers/doctors');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', getDoctors);
router.get('/:id', getDoctor);
router.get('/:id/availability', getDoctorAvailability);

// Protected routes - require doctor role
router.put('/availability', protect, authorize('doctor'), updateAvailability);

module.exports = router;
