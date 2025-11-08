
const express = require('express');
const router = express.Router();
const {
  getUsers,
  updateUser,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getAppointments
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

module.exports = router;
