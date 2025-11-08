
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// @desc    Get all doctors
// @route   GET /api/doctors
// @access  Public
exports.getDoctors = async (req, res, next) => {
  try {
    const filters = [];

    // Filter by specialty
    if (req.query.specialty && req.query.specialty !== 'All Specialties') {
      filters.push({ specialty: { $regex: req.query.specialty, $options: 'i' } });
    }

    // Filter by rating if provided
    if (req.query.rating) {
      filters.push({ rating: { $gte: parseFloat(req.query.rating) } });
    }

    // Filter by featured status
    if (req.query.featured === 'true') {
      filters.push({ featured: true });
    }

    const query = {
      $and: [
        {
          $or: [
            { applicationStatus: 'approved' },
            { applicationStatus: { $exists: false } },
          ],
        },
        ...filters,
      ],
    };

    const doctors = await Doctor.find(query)
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .select('specialty rating location experience featured image availability');

    // Format the data to match the frontend expectations
    const formattedDoctors = doctors.map(doctor => ({
      id: doctor._id,
      name: doctor.user.name,
      specialty: doctor.specialty,
      image: doctor.image,
      rating: doctor.rating,
      location: doctor.location,
      availability: doctor.availability.status === 'available' ? 'Available today' : 'Next available: Tomorrow',
      experience: doctor.experience,
      featured: doctor.featured
    }));

    res.status(200).json(formattedDoctors);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single doctor
// @route   GET /api/doctors/:id
// @access  Public
exports.getDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate({
        path: 'user',
        select: 'name email avatar'
      })
      .populate({
        path: 'reviews.user',
        select: 'name avatar'
      });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.applicationStatus && doctor.applicationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile is not approved yet',
      });
    }

    // Calculate number of reviews
    const reviewCount = doctor.reviews.length;

    // Format the response to match frontend expectations
    const formattedDoctor = {
      id: doctor._id,
      name: doctor.user.name,
      specialty: doctor.specialty,
      image: doctor.image,
      rating: doctor.rating,
      reviews: reviewCount,
      location: doctor.location,
      address: doctor.address,
      phone: doctor.phone,
      email: doctor.user.email,
      availability: doctor.availability.status === 'available' ? 'Available today' : 'Next available: Tomorrow',
      experience: doctor.experience,
      about: doctor.about,
      education: doctor.education,
      languages: doctor.languages,
      specializations: doctor.specializations,
      insurances: doctor.insurances,
      featured: doctor.featured,
      reviewDetails: doctor.reviews.map(review => ({
        id: review._id,
        name: review.user ? review.user.name : 'Anonymous',
        date: formatReviewDate(review.date),
        rating: review.rating,
        comment: review.comment
      }))
    };

    res.status(200).json(formattedDoctor);
  } catch (error) {
    next(error);
  }
};

const normalizeToArray = value => {
  if (Array.isArray(value)) {
    return value
      .map(item => (typeof item === 'string' ? item.trim() : item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  return [];
};

// @desc    Update doctor availability
// @route   PUT /api/doctors/availability
// @access  Private (Doctor only)
exports.updateAvailability = async (req, res, next) => {
  try {
    // Find the doctor by user ID
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found'
      });
    }

    if (doctor.applicationStatus && doctor.applicationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile is awaiting approval',
      });
    }

    // Update availability
    doctor.availability = req.body;
    await doctor.save();

    res.status(200).json({
      success: true,
      data: doctor.availability
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update doctor profile
// @route   PUT /api/doctors/profile
// @access  Private (Doctor only)
exports.updateDoctorProfile = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user.id });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found',
      });
    }

    if (doctor.applicationStatus && doctor.applicationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile is awaiting approval',
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const {
      name,
      avatar,
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
      image,
    } = req.body;

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (phone) user.phone = phone;
    if (specialty) user.specialty = specialty;
    if (about) user.bio = about;

    await user.save();

    if (specialty !== undefined) doctor.specialty = specialty;
    if (experience !== undefined) {
      const parsedExperience = Number(experience);
      if (!Number.isNaN(parsedExperience)) {
        doctor.experience = parsedExperience;
      }
    }
    if (location !== undefined) doctor.location = location;
    if (address !== undefined) doctor.address = address;
    if (phone !== undefined) doctor.phone = phone;
    if (about !== undefined) doctor.about = about;
    if (image !== undefined) doctor.image = image;

    if (education !== undefined) doctor.education = normalizeToArray(education);
    if (languages !== undefined) doctor.languages = normalizeToArray(languages);
    if (specializations !== undefined) doctor.specializations = normalizeToArray(specializations);
    if (insurances !== undefined) doctor.insurances = normalizeToArray(insurances);

    await doctor.save();

    res.status(200).json({
      success: true,
      data: {
        id: doctor._id,
        userId: doctor.user,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        phone: user.phone,
        specialty: doctor.specialty,
        experience: doctor.experience,
        location: doctor.location,
        address: doctor.address,
        about: doctor.about,
        education: doctor.education,
        languages: doctor.languages,
        specializations: doctor.specializations,
        insurances: doctor.insurances,
        image: doctor.image,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get doctor availability for a specific date
// @route   GET /api/doctors/:id/availability
// @access  Public
exports.getDoctorAvailability = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const doctor = await Doctor.findById(id);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    if (doctor.applicationStatus && doctor.applicationStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile is not approved yet'
      });
    }

    // Get day of week from date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Find the working hours for that day
    const daySchedule = doctor.availability.workingHours.find(
      day => day.day === dayOfWeek
    );

    if (!daySchedule || !daySchedule.isWorking) {
      return res.status(200).json({
        success: true,
        available: false,
        message: 'Doctor is not available on this day',
        timeSlots: []
      });
    }

    // Get booked appointments for that date
    const bookedAppointments = await Appointment.find({
      doctorId: id,
      date,
      status: { $nin: ['cancelled'] }
    });

    // Mark time slots as booked if there's an appointment
    const availableTimeSlots = daySchedule.timeSlots.map(slot => {
      const isBooked = bookedAppointments.some(apt => apt.time === slot.time);
      return {
        time: slot.time,
        isAvailable: !isBooked && !slot.isBooked
      };
    });

    res.status(200).json({
      success: true,
      available: true,
      timeSlots: availableTimeSlots
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to format review date
const formatReviewDate = (date) => {
  const now = new Date();
  const reviewDate = new Date(date);
  const diffTime = Math.abs(now - reviewDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  } else if (diffDays <= 30) {
    const diffWeeks = Math.floor(diffDays / 7);
    return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;
  } else {
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
  }
};
