
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      specialty,
      experience,
      location,
      address,
      about,
      education,
      languages,
      specializations,
      insurances,
      avatar,
      licenseNumber,
      consultationFee,
    } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const normalizedRole = role === 'doctor' ? 'doctor' : role || 'patient';
    const normalizeList = value => {
      if (Array.isArray(value)) {
        return value.map(item => (typeof item === 'string' ? item.trim() : item)).filter(Boolean);
      }
      if (typeof value === 'string') {
        return value
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      }
      return [];
    };

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: normalizedRole,
      status: normalizedRole === 'doctor' ? 'pending' : 'active',
      phone: normalizedRole === 'doctor' && phone ? phone : undefined,
      specialty: normalizedRole === 'doctor' && specialty ? specialty : undefined,
      bio: normalizedRole === 'doctor' && about ? about : undefined,
      avatar: avatar || undefined,
    });

    // If registering as a doctor, create doctor profile
    if (normalizedRole === 'doctor') {
      await Doctor.create({
        user: user._id,
        specialty: specialty || 'General Physician',
        experience: Number.isFinite(Number(experience)) ? Number(experience) : 0,
        location: location || 'Medical Center',
        address: address || 'Please update address',
        phone: phone || '',
        about: about || 'Please update doctor information',
        education: normalizeList(education),
        languages: normalizeList(languages).length ? normalizeList(languages) : ['English'],
        specializations: normalizeList(specializations),
        insurances: normalizeList(insurances),
        licenseNumber: licenseNumber || '',
        consultationFee: Number.isFinite(Number(consultationFee)) ? Number(consultationFee) : 0,
        image: avatar || undefined,
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

    const awaitingApproval = normalizedRole === 'doctor';
    let token;
    if (!awaitingApproval) {
      token = user.getSignedJwtToken();
    }

    const responsePayload = {
      success: true,
      message: awaitingApproval
        ? 'Doctor application submitted successfully. Please wait for admin approval.'
        : 'User registered successfully',
      awaitingApproval,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };

    if (token) {
      responsePayload.token = token;
    }

    res.status(201).json(responsePayload);
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

    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      status: user.status,
    };

    if (user.status && user.status !== 'active') {
      let message = 'Your account is not active.';
      if (user.status === 'pending') {
        message = 'Your account is awaiting admin approval.';
      } else if (user.status === 'rejected') {
        message = 'Your account was rejected by the admin.';
      } else if (user.status === 'suspended') {
        message = 'Your account has been suspended. Please contact support.';
      }

      return res.status(403).json({
        success: false,
        message,
        status: user.status,
      });
    }

    // Generate JWT token
    const token = user.getSignedJwtToken();

    // If user is doctor, get additional details
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ user: user._id });
      if (doctor) {
        userData = {
          ...userData,
          doctorId: doctor._id,
          specialty: doctor.specialty,
          availability: doctor.availability,
          applicationStatus: doctor.applicationStatus,
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
