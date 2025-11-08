
const mongoose = require('mongoose');

// Create schedule/availability schema
const TimeSlotSchema = new mongoose.Schema({
  time: {
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false
  }
});

const WorkingDaySchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  isWorking: {
    type: Boolean,
    default: true
  },
  timeSlots: [TimeSlotSchema]
});

// Doctor schema using the User reference
const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: String,
    required: [true, 'Please provide a specialty']
  },
  experience: {
    type: Number,
    required: [true, 'Please provide years of experience']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
      },
      comment: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],
  location: {
    type: String,
    required: [true, 'Please provide a location']
  },
  address: {
    type: String,
    required: [true, 'Please provide an address']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number']
  },
  about: {
    type: String,
    required: [true, 'Please provide a bio/description']
  },
  education: [String],
  languages: [String],
  specializations: [String],
  insurances: [String],
  featured: {
    type: Boolean,
    default: false
  },
  availability: {
    status: {
      type: String,
      enum: ['available', 'unavailable', 'busy'],
      default: 'available'
    },
    workingHours: [WorkingDaySchema]
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate average rating
DoctorSchema.methods.getAverageRating = async function() {
  if (this.reviews.length === 0) {
    return 0;
  }
  
  const total = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  this.rating = total / this.reviews.length;
  await this.save();
  return this.rating;
};

module.exports = mongoose.model('Doctor', DoctorSchema);
