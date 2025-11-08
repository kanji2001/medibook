
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin only)
exports.updateUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    
    // Only allow updating role
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      {
        new: true,
        runValidators: true
      }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create doctor profile (for existing user)
// @route   POST /api/admin/doctors
// @access  Private (Admin only)
exports.createDoctor = async (req, res, next) => {
  try {
    const {
      userId,
      specialty,
      experience,
      location,
      address,
      phone,
      about,
      education,
      languages,
      specializations,
      insurances,
      image,
      featured
    } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if doctor profile already exists
    let doctor = await Doctor.findOne({ user: userId });
    if (doctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists for this user'
      });
    }

    // Update user role to doctor
    user.role = 'doctor';
    await user.save();

    // Create doctor profile
    doctor = await Doctor.create({
      user: userId,
      specialty,
      experience,
      location,
      address,
      phone,
      about,
      education: education || [],
      languages: languages || ['English'],
      specializations: specializations || [],
      insurances: insurances || [],
      image,
      featured: featured || false,
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

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/admin/doctors/:id
// @access  Private (Admin only)
exports.updateDoctor = async (req, res, next) => {
  try {
    const {
      specialty,
      experience,
      location,
      address,
      phone,
      about,
      education,
      languages,
      specializations,
      insurances,
      image,
      featured
    } = req.body;

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      {
        specialty,
        experience,
        location,
        address,
        phone,
        about,
        education,
        languages,
        specializations,
        insurances,
        image,
        featured
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.status(200).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete doctor profile
// @route   DELETE /api/admin/doctors/:id
// @access  Private (Admin only)
exports.deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Update user role back to patient
    await User.findByIdAndUpdate(doctor.user, { role: 'patient' });

    await doctor.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments
// @route   GET /api/admin/appointments
// @access  Private (Admin only)
exports.getAppointments = async (req, res, next) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'doctorId',
        select: 'specialty',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate({
        path: 'userId',
        select: 'name email'
      });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};
