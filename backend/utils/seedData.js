
const mongoose = require('mongoose');
const User = require('../models/User');
const Doctor = require('../models/Doctor');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGODB_URI);

// Sample doctor data
const doctors = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    password: 'password',
    role: 'doctor',
    doctorInfo: {
      specialty: 'Cardiologist',
      experience: 12,
      location: 'New York Medical Center',
      address: '123 Medical Avenue, New York, NY 10001',
      phone: '(212) 555-1234',
      about: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in treating heart diseases and disorders.',
      education: ['Harvard Medical School, M.D.', 'Johns Hopkins Hospital, Fellowship in Cardiology'],
      languages: ['English', 'Spanish'],
      specializations: ['Preventive Cardiology', 'Heart Failure'],
      insurances: ['Blue Cross Blue Shield', 'Aetna'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  },
  {
    name: 'Dr. Michael Chen',
    email: 'michael.chen@example.com',
    password: 'password',
    role: 'doctor',
    doctorInfo: {
      specialty: 'Neurologist',
      experience: 10,
      location: 'Brooklyn Heights Medical',
      address: '456 Neurology Blvd, Brooklyn, NY 11201',
      phone: '(718) 555-5678',
      about: 'Dr. Michael Chen specializes in neurological disorders and has a particular interest in stroke management and multiple sclerosis treatment.',
      education: ['Stanford University, M.D.', 'Mayo Clinic, Residency in Neurology'],
      languages: ['English', 'Mandarin'],
      specializations: ['Stroke Management', 'Multiple Sclerosis'],
      insurances: ['Cigna', 'Medicare'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  },
  {
    name: 'Dr. Emily Davis',
    email: 'emily.davis@example.com',
    password: 'password',
    role: 'doctor',
    doctorInfo: {
      specialty: 'Pediatrician',
      experience: 8,
      location: "Children's Hospital, Boston",
      address: '789 Pediatric Lane, Boston, MA 02115',
      phone: '(617) 555-7890',
      about: "Dr. Emily Davis is a dedicated pediatrician specializing in children's health and development.",
      education: ['Yale School of Medicine, M.D.', "Boston Children's Hospital, Pediatric Residency"],
      languages: ['English', 'French'],
      specializations: ['Neonatal Care', 'Child Development'],
      insurances: ['Aetna', 'UnitedHealthcare'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  },
  {
    name: 'Dr. James Wilson',
    email: 'james.wilson@example.com',
    password: 'password',
    role: 'doctor',
    doctorInfo: {
      specialty: 'Orthopedic Surgeon',
      experience: 15,
      location: 'Los Angeles Orthopedic Center',
      address: '321 Ortho St, Los Angeles, CA 90012',
      phone: '(323) 555-4321',
      about: 'Dr. Wilson is an experienced orthopedic surgeon specializing in joint replacements and sports injuries.',
      education: ['UCLA School of Medicine, M.D.', 'Cedars-Sinai, Orthopedic Surgery Residency'],
      languages: ['English'],
      specializations: ['Sports Injuries', 'Knee and Hip Replacements'],
      insurances: ['Blue Cross Blue Shield', 'Cigna'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  },
  {
    name: 'Dr. Olivia Brown',
    email: 'olivia.brown@example.com',
    password: 'password',
    role: 'doctor',
    doctorInfo: {
      specialty: 'Dermatologist',
      experience: 9,
      location: 'San Francisco Skin Clinic',
      address: '987 Skin Street, San Francisco, CA 94103',
      phone: '(415) 555-6789',
      about: 'Dr. Olivia Brown specializes in cosmetic and medical dermatology with a focus on acne treatment and laser therapy.',
      education: ['Columbia University, M.D.', 'Mount Sinai, Dermatology Residency'],
      languages: ['English', 'Spanish'],
      specializations: ['Acne Treatment', 'Laser Therapy'],
      insurances: ['Humana', 'Aetna'],
      featured: true,
      image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    }
  }
];

// Sample users
const users = [
  {
    name: 'John Doe',
    email: 'patient@example.com',
    password: 'password',
    role: 'patient'
  },
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin'
  }
];

// Import data into DB
const importData = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Doctor.deleteMany();
    
    console.log('Data cleared...');

    // Create users
    const createdUsers = [];
    for (const user of users) {
      const newUser = await User.create(user);
      createdUsers.push(newUser);
    }
    console.log('Users imported...');
    
    // Create doctors
    for (const doctor of doctors) {
      // Create doctor user
      const doctorUser = await User.create({
        name: doctor.name,
        email: doctor.email,
        password: doctor.password,
        role: 'doctor'
      });

      // Create doctor profile
      await Doctor.create({
        user: doctorUser._id,
        specialty: doctor.doctorInfo.specialty,
        experience: doctor.doctorInfo.experience,
        location: doctor.doctorInfo.location,
        address: doctor.doctorInfo.address,
        phone: doctor.doctorInfo.phone,
        about: doctor.doctorInfo.about,
        education: doctor.doctorInfo.education,
        languages: doctor.doctorInfo.languages,
        specializations: doctor.doctorInfo.specializations,
        insurances: doctor.doctorInfo.insurances,
        featured: doctor.doctorInfo.featured,
        image: doctor.doctorInfo.image,
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
    }
    
    console.log('Doctors imported...');
    console.log('Data import complete!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Run import
importData();
