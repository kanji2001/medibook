
const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUser,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments,
  getDoctorApplications,
  approveDoctorApplication,
  rejectDoctorApplication,
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect, authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id', updateUser);

router.post('/doctors', createDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

router.get('/appointments', getAppointments);
router.get('/doctor-applications', getDoctorApplications);
router.post('/doctor-applications/:id/approve', approveDoctorApplication);
router.post('/doctor-applications/:id/reject', rejectDoctorApplication);

module.exports = router;
