
import { Calendar, Users, MessageSquare, Heart, FileText, Activity, LucideIcon } from 'lucide-react';

export interface ServiceItem {
  id: string;
  icon: LucideIcon;
  title: string;
  shortDescription: string;
  longDescription: string;
  benefits: string[];
}

export const servicesData: ServiceItem[] = [
  {
    id: 'service-1',
    icon: Calendar,
    title: 'Online Appointment Booking',
    shortDescription: 'Book appointments with doctors from the comfort of your home.',
    longDescription: 'Our online appointment booking system allows you to schedule visits with healthcare professionals at your convenience, 24/7. Choose from a wide range of specialists, select your preferred time slot, and receive instant confirmation. No more waiting on hold or visiting reception desks.',
    benefits: [
      'Save time with quick, paperless booking',
      'Choose from available time slots that fit your schedule',
      'Receive email and SMS confirmations and reminders',
      'Easily reschedule or cancel if needed',
      'View your complete appointment history'
    ]
  },
  {
    id: 'service-2',
    icon: Users,
    title: 'Find the Right Specialist',
    shortDescription: 'Search and filter doctors based on specialty, location, and reviews.',
    longDescription: 'Our comprehensive doctor search feature helps you find the perfect healthcare provider for your specific needs. Filter by specialty, location, availability, and patient ratings to make informed decisions about your care. Each doctor profile includes detailed information about their qualifications, experience, and approach to patient care.',
    benefits: [
      'Advanced filtering to find exactly what you need',
      'Verified patient reviews and ratings',
      'Detailed doctor profiles with education and experience',
      'Compare multiple doctors side by side',
      'Find doctors who accept your insurance'
    ]
  },
  {
    id: 'service-3',
    icon: MessageSquare,
    title: 'Telemedicine Consultations',
    shortDescription: 'Consult with doctors remotely via video calls.',
    longDescription: 'Access quality healthcare without leaving your home through our secure telemedicine platform. Connect with doctors via video calls for consultations, follow-ups, prescription renewals, and more. Our platform ensures patient privacy while providing a seamless experience comparable to in-person visits.',
    benefits: [
      'No travel required - save time and reduce exposure',
      'Same quality care as in-person visits for many conditions',
      'Secure, HIPAA-compliant video platform',
      'Digital prescriptions sent directly to your pharmacy',
      'Lower costs than many in-person visits'
    ]
  },
  {
    id: 'service-4',
    icon: Heart,
    title: 'Preventive Health Programs',
    shortDescription: 'Personalized health plans to prevent illness and maintain wellness.',
    longDescription: 'Our preventive health programs are designed to keep you healthy before problems arise. Based on your age, gender, family history, and lifestyle factors, we create personalized wellness plans that include recommended screenings, vaccinations, and lifestyle modifications. Regular check-ins help monitor progress and adjust recommendations as needed.',
    benefits: [
      'Early detection of potential health issues',
      'Personalized wellness plans based on your risk factors',
      'Regular health screenings and assessments',
      'Lifestyle coaching for nutrition, exercise, and stress management',
      'Long-term health monitoring and support'
    ]
  },
  {
    id: 'service-5',
    icon: FileText,
    title: 'Digital Health Records',
    shortDescription: 'Secure access to your complete medical history.',
    longDescription: 'Our digital health record system gives you and your healthcare providers secure access to your complete medical history. Track medications, lab results, immunizations, allergies, and medical conditions all in one place. This comprehensive view helps doctors make more informed decisions and reduces duplicate tests and procedures.',
    benefits: [
      'All your health information in one secure location',
      'Easily share records with new providers',
      'Track medications and receive refill reminders',
      'View lab results as soon as they\'re available',
      'Reduce medical errors through better information'
    ]
  },
  {
    id: 'service-6',
    icon: Activity,
    title: 'Health Monitoring',
    shortDescription: 'Track vital signs and health metrics with wearable integration.',
    longDescription: 'Our health monitoring service integrates with popular fitness trackers and health devices to provide a comprehensive view of your health metrics. Track heart rate, blood pressure, sleep patterns, activity levels, and more. This data is analyzed to identify trends and can be shared with your healthcare provider for more personalized care.',
    benefits: [
      'Continuous monitoring of important health metrics',
      'Integration with popular wearable devices',
      'Personalized health insights and recommendations',
      'Early warning system for potential health issues',
      'Share data securely with your healthcare team'
    ]
  }
];
