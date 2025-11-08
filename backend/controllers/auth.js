
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'patient'
    });

    // If registering as a doctor, create doctor profile
    if (role === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialty: req.body.specialty || 'General Physician',
        experience: req.body.experience || 0,
        location: req.body.location || 'Medical Center',
        address: req.body.address || 'Please update address',
        phone: req.body.phone || '',
        about: req.body.about || 'Please update doctor information',
        education: req.body.education || [],
        languages: req.body.languages || ['English'],
        specializations: req.body.specializations || [],
        insurances: req.body.insurances || [],
        availability: {
          status: 'available',
          workingHours: [
            { 
              day: 'Monday', 
              isWorking: true, 
              timeSlots: [
                { time: '9:00 AM', isBooked: false },
                { time: '10:00 AM', isBooked: false },
                { time: '11:00 AM', isBooked: false },
                { time: '2:00 PM', isBooked: false },
                { time: '3:00 PM', isBooked: false }
              ]
            },
            { 
              day: 'Tuesday', 
              isWorking: true, 
              timeSlots: [
                { time: '9:00 AM', isBooked: false },
                { time: '10:00 AM', isBooked: false },
                { time: '11:00 AM', isBooked: false },
                { time: '2:00 PM', isBooked: false },
                { time: '3:00 PM', isBooked: false }
              ]
            },
            { 
              day: 'Wednesday', 
              isWorking: true, 
              timeSlots: [
                { time: '9:00 AM', isBooked: false },
                { time: '10:00 AM', isBooked: false },
                { time: '11:00 AM', isBooked: false },
                { time: '2:00 PM', isBooked: false },
                { time: '3:00 PM', isBooked: false }
              ]
            },
            { 
              day: 'Thursday', 
              isWorking: true, 
              timeSlots: [
                { time: '9:00 AM', isBooked: false },
                { time: '10:00 AM', isBooked: false },
                { time: '11:00 AM', isBooked: false },
                { time: '2:00 PM', isBooked: false },
                { time: '3:00 PM', isBooked: false }
              ]
            },
            { 
              day: 'Friday', 
              isWorking: true, 
              timeSlots: [
                { time: '9:00 AM', isBooked: false },
                { time: '10:00 AM', isBooked: false },
                { time: '11:00 AM', isBooked: false },
                { time: '2:00 PM', isBooked: false },
                { time: '3:00 PM', isBooked: false }
              ]
            },
            { day: 'Saturday', isWorking: false, timeSlots: [] },
            { day: 'Sunday', isWorking: false, timeSlots: [] }
          ]
        }
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    };

    // If user is doctor, get additional details
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        userData = {
          ...userData,
          doctorId: doctor._id,
          specialty: doctor.specialty,
          availability: doctor.availability
        };
      }
    }

    res.status(200).json({
      success: true,
      token,
      user: userData
    });
  } catch (error) {
    next(error);
  }
};
