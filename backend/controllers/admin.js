
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin only)
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    const doctors = await Doctor.find().populate({
      path: 'user',
      select: 'name email status role',
    });

    const doctorByUser = new Map();
    doctors.forEach(doctor => {
      doctorByUser.set(doctor.user._id.toString(), doctor);
    });

    const data = users.map(user => {
      const doctorProfile = doctorByUser.get(user._id.toString());
      const userObj = user.toObject();

      if (doctorProfile) {
        userObj.doctorProfile = {
          id: doctorProfile._id,
          specialty: doctorProfile.specialty,
          experience: doctorProfile.experience,
          location: doctorProfile.location,
          address: doctorProfile.address,
          phone: doctorProfile.phone,
          about: doctorProfile.about,
          applicationStatus: doctorProfile.applicationStatus,
          licenseNumber: doctorProfile.licenseNumber,
          consultationFee: doctorProfile.consultationFee,
          appliedAt: doctorProfile.appliedAt,
          approvedAt: doctorProfile.approvedAt,
        };
      }

      return userObj;
    });

    res.status(200).json({
      success: true,
      count: data.length,
      data,
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
      name,
      email,
      password,
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
      featured,
      avatar,
      licenseNumber,
      consultationFee,
    } = req.body;

    if (!specialty || !experience || !location || !address || !phone || !about) {
      return res.status(400).json({
        success: false,
        message:
          'specialty, experience, location, address, phone, and about fields are required'
      });
    }

    const toArray = value => {
      if (Array.isArray(value)) {
        return value.filter(Boolean);
      }
      if (typeof value === 'string' && value.trim().length) {
        return value
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      }
      return [];
    };

    let user;
    let createdUser = false;

    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
    } else {
      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'name, email, and password are required when userId is not provided'
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'A user with this email already exists'
        });
      }

      user = await User.create({
        name,
        email,
        password,
        role: 'doctor',
        phone,
        avatar: avatar || image || '',
        specialty,
        bio: about
      });
      createdUser = true;
    }

    // Ensure the user is marked as a doctor and sync profile fields
    user.role = 'doctor';
    user.status = 'active';
    if (avatar || image) {
      user.avatar = avatar || image;
    }
    if (phone) {
      user.phone = phone;
    }
    if (specialty) {
      user.specialty = specialty;
    }
    if (about) {
      user.bio = about;
    }
    await user.save();

    // Prevent duplicate doctor profiles
    const existingDoctor = await Doctor.findOne({ user: user._id });
    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: 'Doctor profile already exists for this user'
      });
    }

    let doctor;
    try {
      doctor = await Doctor.create({
        user: user._id,
        specialty,
        experience,
        location,
        address,
        phone,
        about,
        education: toArray(education),
        languages: toArray(languages).length ? toArray(languages) : ['English'],
        specializations: toArray(specializations),
        insurances: toArray(insurances),
        image,
        featured: featured || false,
        licenseNumber: licenseNumber || '',
        consultationFee: Number.isFinite(Number(consultationFee))
          ? Number(consultationFee)
          : 0,
        applicationStatus: 'approved',
        approvedAt: new Date(),
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
    } catch (error) {
      if (createdUser) {
        await user.deleteOne();
      }
      throw error;
    }

    await doctor.populate({ path: 'user', select: '-password' });

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

// @desc    Get pending doctor applications
// @route   GET /api/admin/doctor-applications
// @access  Private (Admin only)
exports.getDoctorApplications = async (req, res, next) => {
  try {
    const doctors = await Doctor.find({ applicationStatus: 'pending' }).populate({
      path: 'user',
      select: 'name email phone status role createdAt',
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve doctor application
// @route   POST /api/admin/doctor-applications/:id/approve
// @access  Private (Admin only)
exports.approveDoctorApplication = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id).populate({
      path: 'user',
      select: 'name email status role phone specialty bio',
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor application not found',
      });
    }

    doctor.applicationStatus = 'approved';
    doctor.approvedAt = new Date();
    doctor.approvalNotes = req.body.notes || '';
    await doctor.save();

    const userId = doctor.user && doctor.user._id ? doctor.user._id : doctor.user;
    const user = await User.findById(userId);
    if (user) {
      user.status = 'active';
      user.role = 'doctor';
      if (doctor.phone && !user.phone) user.phone = doctor.phone;
      if (doctor.specialty && !user.specialty) user.specialty = doctor.specialty;
      if (doctor.about && !user.bio) user.bio = doctor.about;
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject doctor application
// @route   POST /api/admin/doctor-applications/:id/reject
// @access  Private (Admin only)
exports.rejectDoctorApplication = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor application not found',
      });
    }

    doctor.applicationStatus = 'rejected';
    doctor.rejectionReason = req.body.reason || '';
    doctor.approvalNotes = req.body.notes || '';
    await doctor.save();

    const userId = doctor.user && doctor.user._id ? doctor.user._id : doctor.user;
    const user = await User.findById(userId);
    if (user) {
      user.status = 'rejected';
      await user.save();
    }

    res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    next(error);
  }
};
