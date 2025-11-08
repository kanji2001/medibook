
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const path = require('path');

// Load environment variables
dotenv.config();

// Route imports
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const doctorRoutes = require('./routes/doctors');
const appointmentRoutes = require('./routes/appointments');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
const BODY_SIZE_LIMIT = process.env.REQUEST_BODY_LIMIT || '5mb';
app.use(express.json({ limit: BODY_SIZE_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: BODY_SIZE_LIMIT }));
const corsOptions = {
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes
app.options('/api/*', cors(corsOptions)); // Covers all API routes
app.use(morgan('dev')); // HTTP request logger

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connection established'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', paymentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
