const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const router = express.Router();

const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;

const createRazorpayInstance = () => {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Missing Razorpay configuration. Ensure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET are set.');
  }

  return new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
};

router.post('/create-order', async (req, res, next) => {
  try {
    const { amount } = req.body;

    console.log('Received Razorpay order request with amount:', amount);

    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required to create an order.',
      });
    }

    const normalizedAmount = Number(amount);

    if (Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number representing paise.',
      });
    }

    const razorpay = createRazorpayInstance();

    const order = await razorpay.orders.create({
      amount: Math.round(normalizedAmount),
      currency: 'INR',
      payment_capture: 1,
    });

    return res.status(201).json({
      success: true,
      order,
      key: RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);

    const status = error?.statusCode || error?.status || 500;
    const message =
      error?.error?.description ||
      error?.message ||
      'Unable to create Razorpay order. Please try again later.';

    return res.status(status).json({
      success: false,
      message,
    });
  }
});

router.post('/verify-payment', (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Verification data is incomplete.',
    });
  }

  if (!RAZORPAY_KEY_SECRET) {
    return res.status(500).json({
      success: false,
      message: 'Missing Razorpay secret configuration.',
    });
  }

  const payload = `${razorpay_order_id}|${razorpay_payment_id}`;

  const expectedSignature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET)
    .update(payload)
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (!isAuthentic) {
    return res.status(400).json({
      success: false,
      message: 'Payment signature verification failed.',
    });
  }

  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully.',
    data: {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    },
  });
});

module.exports = router;


