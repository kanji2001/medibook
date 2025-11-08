
const express = require('express');
const router = express.Router();
const {
  createPayment,
  verifyPayment,
  processRefund
} = require('../controllers/payments');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.post('/create', createPayment);
router.post('/verify', verifyPayment);
router.post('/refund', processRefund);

module.exports = router;
