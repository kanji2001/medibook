
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    bio: user.bio,
    status: user.status,
    };

    // If user is a doctor, include doctor profile
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        userData.doctorId = doctor._id;
        userData.specialty = doctor.specialty;
        userData.availability = doctor.availability;
        userData.applicationStatus = doctor.applicationStatus;
      }
    }

    res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    // Fields to update
    const fieldsToUpdate = {};
    
    // Allow updating these fields
    if (req.body.name) fieldsToUpdate.name = req.body.name;
    if (req.body.avatar) fieldsToUpdate.avatar = req.body.avatar;
    if (req.body.phone) fieldsToUpdate.phone = req.body.phone;
    
    // Don't allow updating email or role through this endpoint
    delete req.body.email;
    delete req.body.role;
    delete req.body.password;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        new: true,
        runValidators: true
      }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone
      }
    });
  } catch (error) {
    next(error);
  }
};
