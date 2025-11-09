
import { Calendar, Users, MessageSquare, Heart, FileText, Activity, LucideIcon } from 'lucide-react';

interface ServiceHighlight {
  title: string;
  description: string;
}

interface ServiceFaq {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  slug: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  shortDescription: string;
  longDescription: string;
  heroImage: string;
  benefits: string[];
  highlights: ServiceHighlight[];
  steps: string[];
  idealFor: string[];
  faqs: ServiceFaq[];
}

export const servicesData: ServiceItem[] = [
  {
    id: 'service-1',
    slug: 'general-consultation',
    icon: Calendar,
    title: 'Online Appointment Booking',
    tagline: 'Same-day access to trusted primary care physicians wherever you are.',
    shortDescription: 'Book appointments with doctors from the comfort of your home.',
    longDescription:
      'Our online appointment booking system allows you to schedule visits with healthcare professionals at your convenience, 24/7. Choose from a wide range of specialists, select your preferred time slot, and receive instant confirmation. No more waiting on hold or visiting reception desks.',
    heroImage:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Save time with quick, paperless booking',
      'Choose from available time slots that fit your schedule',
      'Receive email and SMS confirmations and reminders',
      'Easily reschedule or cancel if needed',
      'View your complete appointment history',
    ],
    highlights: [
      {
        title: 'Verified Physicians',
        description: 'Every doctor on MediBook is licensed, credentialed, and continually reviewed.',
      },
      {
        title: 'Flexible Scheduling',
        description: 'Morning, evening, and weekend appointments based on real-time availability.',
      },
      {
        title: 'Integrated Check-In',
        description: 'Securely complete intake forms and insurance details before arriving.',
      },
    ],
    steps: [
      'Select a provider based on specialty, reviews, or location.',
      'Choose an appointment time that fits your schedule.',
      'Share your visit reason and any relevant health concerns.',
      'Receive reminders and check-in instructions prior to your visit.',
    ],
    idealFor: [
      'Annual wellness visits or new patient consultations.',
      'Managing chronic conditions and medication reviews.',
      'Obtaining referrals to in-network specialists.',
    ],
    faqs: [
      {
        question: 'Can I book same-day appointments?',
        answer:
          'Yes. Many providers release real-time openings. If a same-day slot is available, you can confirm instantly.',
      },
      {
        question: 'Is insurance required?',
        answer:
          'You can book with or without insurance. We display accepted insurance plans on each provider profile.',
      },
      {
        question: 'How do cancellations work?',
        answer:
          'Each provider sets their own policy. Most visits can be cancelled or rescheduled up to 12 hours in advance with no fee.',
      },
    ],
  },
  {
    id: 'service-2',
    slug: 'specialist-appointments',
    icon: Users,
    title: 'Find the Right Specialist',
    tagline: 'Expert care across cardiology, dermatology, orthopedics, pediatrics, and more.',
    shortDescription: 'Search and filter doctors based on specialty, location, and reviews.',
    longDescription:
      'Our comprehensive doctor search feature helps you find the perfect healthcare provider for your specific needs. Filter by specialty, location, availability, and patient ratings to make informed decisions about your care. Each doctor profile includes detailed information about their qualifications, experience, and approach to patient care.',
    heroImage:
      'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Advanced filtering to find exactly what you need',
      'Verified patient reviews and ratings',
      'Detailed doctor profiles with education and experience',
      'Compare multiple doctors side by side',
      'Find doctors who accept your insurance',
    ],
    highlights: [
      {
        title: 'Referral Management',
        description: 'Upload referral documents securely and share them directly with specialists.',
      },
      {
        title: 'Collaborative Care',
        description: 'We coordinate with your primary doctor so everyone stays informed.',
      },
      {
        title: 'Second Opinions',
        description: 'Consult with board-certified sub-specialists for complex diagnoses.',
      },
    ],
    steps: [
      'Search by specialty, condition, or procedure.',
      'Filter by insurance, telehealth availability, and patient ratings.',
      'Review credentials, hospital affiliations, and success metrics.',
      'Book directly or request a referral from your primary provider.',
    ],
    idealFor: [
      'Patients with complex or chronic health conditions.',
      'Families seeking pediatric sub-specialists.',
      'Individuals comparing multiple treatment options.',
    ],
    faqs: [
      {
        question: 'Do I need a referral?',
        answer:
          'Some specialists require referrals depending on your insurance. We flag those requirements before you book.',
      },
      {
        question: 'Can specialists access my records?',
        answer:
          'Yes. With your permission, MediBook shares relevant medical history and diagnostics for continuity of care.',
      },
      {
        question: 'Are virtual specialist visits available?',
        answer:
          'Many specialties offer virtual consults for follow-ups or second opinions. Availability is visible on each profile.',
      },
    ],
  },
  {
    id: 'service-3',
    slug: 'online-consultations',
    icon: MessageSquare,
    title: 'Telemedicine Consultations',
    tagline: 'Secure video visits that fit your schedule without the waiting room.',
    shortDescription: 'Consult with doctors remotely via video calls.',
    longDescription:
      'Access quality healthcare without leaving your home through our secure telemedicine platform. Connect with doctors via video calls for consultations, follow-ups, prescription renewals, and more. Our platform ensures patient privacy while providing a seamless experience comparable to in-person visits.',
    heroImage:
      'https://images.unsplash.com/photo-1587502536965-1a179975fcb3?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'No travel required - save time and reduce exposure',
      'Same quality care as in-person visits for many conditions',
      'Secure, HIPAA-compliant video platform',
      'Digital prescriptions sent directly to your pharmacy',
      'Lower costs than many in-person visits',
    ],
    highlights: [
      {
        title: 'Instant Set-Up',
        description: 'Join visits from any device—no downloads required for patients.',
      },
      {
        title: 'Integrated Labs',
        description: 'Providers can order labs or imaging and follow results within MediBook.',
      },
      {
        title: 'Care Continuity',
        description: 'Post-visit notes and care plans sync to your MediBook health record.',
      },
    ],
    steps: [
      'Choose a provider and pick a virtual appointment slot.',
      'Complete a short pre-visit questionnaire and upload photos if relevant.',
      'Join the secure video room from your phone or computer.',
      'Receive a visit summary, prescriptions, and next steps electronically.',
    ],
    idealFor: [
      'Follow-up visits and chronic condition management.',
      'Medication refills, lab review, or new symptom triage.',
      'Behavioral health consultations and coaching.',
    ],
    faqs: [
      {
        question: 'What technical requirements do I need?',
        answer:
          'A reliable internet connection and a camera-enabled device. We recommend Chrome, Safari, or Edge browsers.',
      },
      {
        question: 'Can telemedicine doctors prescribe medication?',
        answer:
          'Yes, for most non-controlled medications. Prescriptions are sent straight to your preferred pharmacy.',
      },
      {
        question: 'Is the video visit recorded?',
        answer:
          'No. We never record patient visits. Notes are documented in your secure chart for clinical use only.',
      },
    ],
  },
  {
    id: 'service-4',
    slug: 'preventive-care',
    icon: Heart,
    title: 'Preventive Health Programs',
    tagline: 'Personalized wellness plans built with physicians, nutritionists, and coaches.',
    shortDescription: 'Personalized health plans to prevent illness and maintain wellness.',
    longDescription:
      'Our preventive health programs are designed to keep you healthy before problems arise. Based on your age, gender, family history, and lifestyle factors, we create personalized wellness plans that include recommended screenings, vaccinations, and lifestyle modifications. Regular check-ins help monitor progress and adjust recommendations as needed.',
    heroImage:
      'https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Early detection of potential health issues',
      'Personalized wellness plans based on your risk factors',
      'Regular health screenings and assessments',
      'Lifestyle coaching for nutrition, exercise, and stress management',
      'Long-term health monitoring and support',
    ],
    highlights: [
      {
        title: '360° Assessments',
        description: 'Baseline labs, biometrics, and lifestyle audits to tailor your program.',
      },
      {
        title: 'Dedicated Coach',
        description: 'Monthly sessions with certified health coaches who track progress.',
      },
      {
        title: 'Smart Insights',
        description: 'Wearable integration provides real-time feedback and goal adjustments.',
      },
    ],
    steps: [
      'Complete a comprehensive health assessment and goal-setting session.',
      'Receive your personalized care plan with nutrition, movement, and sleep targets.',
      'Check in with your coach and clinical team each month.',
      'Track progress via wearable sync and quarterly wellness reviews.',
    ],
    idealFor: [
      'Individuals focused on long-term wellness and disease prevention.',
      'Employees enrolled in corporate wellness initiatives.',
      'Patients managing family histories of chronic disease.',
    ],
    faqs: [
      {
        question: 'Are lab tests included?',
        answer:
          'Yes. Each program includes initial labs and follow-up panels based on your risk profile.',
      },
      {
        question: 'Do you work with existing providers?',
        answer:
          'We collaborate with your primary doctor and specialists to align lifestyle goals with clinical guidance.',
      },
      {
        question: 'Can I pause the program?',
        answer:
          'Programs can be paused for up to 2 months per year while preserving your progress and coaching relationship.',
      },
    ],
  },
  {
    id: 'service-5',
    slug: 'medical-checkups',
    icon: FileText,
    title: 'Digital Health Records',
    tagline: 'Your complete medical history secured in one place and accessible anywhere.',
    shortDescription: 'Secure access to your complete medical history.',
    longDescription:
      'Our digital health record system gives you and your healthcare providers secure access to your complete medical history. Track medications, lab results, immunizations, allergies, and medical conditions all in one place. This comprehensive view helps doctors make more informed decisions and reduces duplicate tests and procedures.',
    heroImage:
      'https://images.unsplash.com/photo-1587502537745-84b0510f28ce?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'All your health information in one secure location',
      'Easily share records with new providers',
      'Track medications and receive refill reminders',
      'View lab results as soon as they\'re available',
      'Reduce medical errors through better information',
    ],
    highlights: [
      {
        title: 'Universal Access',
        description: 'Share records instantly with any MediBook provider or export encrypted files.',
      },
      {
        title: 'Medication Safety',
        description: 'Automated interaction alerts when new prescriptions are added.',
      },
      {
        title: 'Care Timeline',
        description: 'See every visit, procedure, and lab chronologically in your health journal.',
      },
    ],
    steps: [
      'Import records from existing providers using secure HIPAA-compliant transfer.',
      'Organize allergies, medications, and vaccination history in your profile.',
      'Give new providers temporary access links before appointments.',
      'Review visit notes and lab results directly in your MediBook dashboard.',
    ],
    idealFor: [
      'Families managing care for multiple members.',
      'Patients seeing providers across different health systems.',
      'Individuals wanting transparency into their medical data.',
    ],
    faqs: [
      {
        question: 'Is my data encrypted?',
        answer:
          'Yes. We use bank-grade encryption at rest and in transit, with multi-factor authentication for access.',
      },
      {
        question: 'Can I connect wearable devices?',
        answer:
          'Absolutely. Integrate Apple Health, Fitbit, Garmin, and other devices for continuous tracking.',
      },
      {
        question: 'How do I share records with a new doctor?',
        answer:
          'Send a secure time-limited link or download a PDF package of your latest health summary.',
      },
    ],
  },
  {
    id: 'service-6',
    slug: 'emergency-care',
    icon: Activity,
    title: 'Health Monitoring',
    tagline: 'Real-time monitoring and rapid escalation pathways for urgent issues.',
    shortDescription: 'Track vital signs and health metrics with wearable integration.',
    longDescription:
      'Our health monitoring service integrates with popular fitness trackers and health devices to provide a comprehensive view of your health metrics. Track heart rate, blood pressure, sleep patterns, activity levels, and more. This data is analyzed to identify trends and can be shared with your healthcare provider for more personalized care.',
    heroImage:
      'https://images.unsplash.com/photo-1581092152835-30ab079f19b9?auto=format&fit=crop&w=1200&q=80',
    benefits: [
      'Continuous monitoring of important health metrics',
      'Integration with popular wearable devices',
      'Personalized health insights and recommendations',
      'Early warning system for potential health issues',
      'Share data securely with your healthcare team',
    ],
    highlights: [
      {
        title: '24/7 Clinical Team',
        description: 'Registered nurses escalate alerts and coordinate care in real time.',
      },
      {
        title: 'Custom Thresholds',
        description: 'Set individualized alert ranges that align with your physician’s guidance.',
      },
      {
        title: 'Emergency Dispatch',
        description: 'Critical alerts trigger direct coordination with local emergency services.',
      },
    ],
    steps: [
      'Connect your wearable or remote monitoring device to MediBook.',
      'Set personalized thresholds and escalation preferences with our clinical team.',
      'Receive insights and coaching based on daily health trends.',
      'Get instant outreach if readings fall outside safe ranges.',
    ],
    idealFor: [
      'Patients managing high-risk cardiac or respiratory conditions.',
      'Seniors who want additional peace of mind living independently.',
      'Post-surgery patients requiring short-term monitoring.',
    ],
    faqs: [
      {
        question: 'What devices are supported?',
        answer:
          'We support FDA-cleared devices and leading consumer wearables including Apple Watch, Withings, and Omron.',
      },
      {
        question: 'Who reviews my data?',
        answer:
          'Our monitoring center is staffed by registered nurses who collaborate closely with your physicians.',
      },
      {
        question: 'Is emergency dispatch automatic?',
        answer:
          'You set escalation preferences. For critical readings, we can contact you, your caregivers, and emergency services as needed.',
      },
    ],
  },
];
