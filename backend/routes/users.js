
const express = require('express');
const router = express.Router();
const { 
  getUserProfile, 
  updateUserProfile 
} = require('../controllers/users');
const { protect } = require('../middleware/auth');

// Protected routes - require authentication
router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

module.exports = router;
