
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Load environment variables
dotenv.config();

// Sample doctor data
const doctors = [
  {
    user: {
      name: 'Dr. Sarah Johnson',
      email: 'doctor@example.com',
      password: 'password',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    specialty: 'Cardiologist',
    experience: 12,
    location: 'New York Medical Center',
    address: '123 Medical Plaza, New York, NY',
    phone: '(555) 123-4567',
    about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating heart conditions. She specializes in preventive cardiology and cardiac imaging.',
    education: ['MD, Harvard Medical School', 'Residency, Johns Hopkins Hospital', 'Fellowship, Mayo Clinic'],
    languages: ['English', 'Spanish'],
    specializations: ['Preventive Cardiology', 'Cardiac Imaging', 'Heart Failure Management'],
    insurances: ['Aetna', 'Blue Cross', 'Cigna', 'UnitedHealthcare'],
    featured: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    user: {
      name: 'Dr. James Williams',
      email: 'james.williams@example.com',
      password: 'password',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    specialty: 'Neurologist',
    experience: 15,
    location: 'Central Neurology Center',
    address: '456 Health Avenue, Boston, MA',
    phone: '(555) 234-5678',
    about: 'Dr. James Williams is a highly skilled neurologist specializing in the diagnosis and treatment of disorders affecting the nervous system. With 15 years of experience, he has helped numerous patients manage conditions like migraines, epilepsy, and stroke recovery.',
    education: ['MD, Yale School of Medicine', 'Residency, Massachusetts General Hospital'],
    languages: ['English', 'French'],
    specializations: ['Headache Medicine', 'Epilepsy', 'Stroke Recovery'],
    insurances: ['Medicare', 'Humana', 'Kaiser', 'Blue Shield'],
    featured: true,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  },
  {
    user: {
      name: 'Dr. Emily Chen',
      email: 'emily.chen@example.com',
      password: 'password',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80'
    },
    specialty: 'Dermatologist',
    experience: 8,
    location: 'Clear Skin Dermatology',
    address: '789 Beauty Lane, San Francisco, CA',
    phone: '(555) 345-6789',
    about: 'Dr. Emily Chen is a board-certified dermatologist focused on treating skin conditions and performing cosmetic procedures. She is known for her gentle approach and thorough examinations.',
    education: ['MD, Stanford University', 'Residency, University of California San Francisco'],
    languages: ['English', 'Mandarin', 'Cantonese'],
    specializations: ['Cosmetic Dermatology', 'Acne Treatment', 'Skin Cancer Screening'],
    insurances: ['Blue Cross', 'Aetna', 'UnitedHealthcare'],
    featured: false,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80'
  },
  {
    user: {
      name: 'Dr. Michael Rodriguez',
      email: 'michael.rodriguez@example.com',
      password: 'password',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80'
    },
    specialty: 'Orthopedic Surgeon',
    experience: 20,
    location: 'Advanced Orthopedic Center',
    address: '101 Bone Street, Chicago, IL',
    phone: '(555) 456-7890',
    about: 'Dr. Michael Rodriguez is a top-rated orthopedic surgeon with 20 years of experience in joint replacement and sports medicine. He has worked with professional athletes and has pioneered minimally invasive surgical techniques.',
    education: ['MD, University of Chicago', 'Residency, Rush University Medical Center', 'Fellowship, Andrews Institute'],
    languages: ['English', 'Spanish'],
    specializations: ['Joint Replacement', 'Sports Medicine', 'Minimally Invasive Surgery'],
    insurances: ['Medicare', 'Blue Cross', 'Cigna', 'Humana'],
    featured: true,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1964&q=80'
  },
  {
    user: {
      name: 'Dr. Olivia Washington',
      email: 'olivia.washington@example.com',
      password: 'password',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80'
    },
    specialty: 'Pediatrician',
    experience: 10,
    location: 'Sunshine Pediatrics',
    address: '202 Children\'s Way, Seattle, WA',
    phone: '(555) 567-8901',
    about: 'Dr. Olivia Washington is a compassionate pediatrician dedicated to the health and development of children from birth to adolescence. She creates a welcoming environment where both children and parents feel comfortable and heard.',
    education: ['MD, University of Washington', 'Residency, Seattle Children\'s Hospital'],
    languages: ['English'],
    specializations: ['Newborn Care', 'Developmental Pediatrics', 'Adolescent Medicine'],
    insurances: ['Blue Cross', 'Aetna', 'UnitedHealthcare', 'Tricare'],
    featured: false,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1651008376811-b90baee60c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80'
  },
  {
    user: {
      name: 'Dr. Robert Kim',
      email: 'robert.kim@example.com',
      password: 'password',
      role: 'doctor',
      avatar: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    },
    specialty: 'Psychiatrist',
    experience: 14,
    location: 'Mind Wellness Center',
    address: '303 Peaceful Drive, Los Angeles, CA',
    phone: '(555) 678-9012',
    about: 'Dr. Robert Kim is a board-certified psychiatrist specializing in mood disorders and anxiety. He takes a holistic approach to mental health, combining medication management with therapy and lifestyle modifications.',
    education: ['MD, UCLA School of Medicine', 'Residency, UCLA Neuropsychiatric Institute'],
    languages: ['English', 'Korean'],
    specializations: ['Mood Disorders', 'Anxiety', 'PTSD'],
    insurances: ['Blue Cross', 'Cigna', 'Aetna', 'Oscar'],
    featured: true,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
  }
];

// Default time slots for each doctor
const defaultTimeSlots = [
  { time: '9:00 AM', isBooked: false },
  { time: '10:00 AM', isBooked: false },
  { time: '11:00 AM', isBooked: false },
  { time: '1:00 PM', isBooked: false },
  { time: '2:00 PM', isBooked: false },
  { time: '3:00 PM', isBooked: false },
  { time: '4:00 PM', isBooked: false }
];

// Default working days
const defaultWorkingDays = [
  { day: 'Monday', isWorking: true, timeSlots: [...defaultTimeSlots] },
  { day: 'Tuesday', isWorking: true, timeSlots: [...defaultTimeSlots] },
  { day: 'Wednesday', isWorking: true, timeSlots: [...defaultTimeSlots] },
  { day: 'Thursday', isWorking: true, timeSlots: [...defaultTimeSlots] },
  { day: 'Friday', isWorking: true, timeSlots: [...defaultTimeSlots] },
  { day: 'Saturday', isWorking: false, timeSlots: [] },
  { day: 'Sunday', isWorking: false, timeSlots: [] }
];

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('MongoDB connected');
    
    try {
      // Clear existing data
      await User.deleteMany({ role: 'doctor' });
      await Doctor.deleteMany({});
      console.log('Existing doctors cleared');
      
      // Create admin user if it doesn't exist
      const adminExists = await User.findOne({ email: 'admin@example.com' });
      if (!adminExists) {
        await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password',
          role: 'admin'
        });
        console.log('Admin user created');
      }
      
      // Create patient user if it doesn't exist
      const patientExists = await User.findOne({ email: 'patient@example.com' });
      if (!patientExists) {
        await User.create({
          name: 'John Doe',
          email: 'patient@example.com',
          password: 'password',
          role: 'patient'
        });
        console.log('Patient user created');
      }
      
      // Create doctors
      for (const doctorData of doctors) {
        // Create doctor user account
        const user = await User.create({
          name: doctorData.user.name,
          email: doctorData.user.email,
          password: doctorData.user.password,
          role: doctorData.user.role,
          avatar: doctorData.user.avatar
        });
        
        // Create doctor profile
        await Doctor.create({
          user: user._id,
          specialty: doctorData.specialty,
          experience: doctorData.experience,
          location: doctorData.location,
          address: doctorData.address,
          phone: doctorData.phone,
          about: doctorData.about,
          education: doctorData.education,
          languages: doctorData.languages,
          specializations: doctorData.specializations,
          insurances: doctorData.insurances,
          featured: doctorData.featured,
          rating: doctorData.rating,
          image: doctorData.image,
          availability: {
            status: 'available',
            workingHours: defaultWorkingDays
          }
        });
      }
      
      console.log(`${doctors.length} doctors seeded`);
      process.exit(0);
    } catch (error) {
      console.error('Seeding error:', error);
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
