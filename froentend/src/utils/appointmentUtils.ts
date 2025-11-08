
import { v4 as uuidv4 } from 'uuid';
import { format, parse } from 'date-fns';

// Types for appointment data
export interface AppointmentData {
  id: string;
  doctorId: string;
  userId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  patientEmail?: string;
  patientPhone?: string;
  reason?: string;
  paymentStatus?: 'pending' | 'completed';
  paymentMethod?: 'online' | 'offline' | null;
  amount?: number;
}

export type AppointmentStatus = 'pending' | 'approved' | 'confirmed' | 'completed' | 'cancelled' | 'paid' | 'unpaid';

// Function to create a new appointment in localStorage (for demo)
export const createAppointment = (appointmentData: Omit<AppointmentData, 'id' | 'createdAt'>): AppointmentData => {
  // Generate a unique ID and add creation timestamp
  const appointment: AppointmentData = {
    ...appointmentData,
    id: uuidv4(),
    createdAt: new Date().toISOString()
  };
  
  // Get existing appointments from localStorage
  const existingAppointments = getAppointments();
  
  // Add the new appointment
  const updatedAppointments = [...existingAppointments, appointment];
  
  // Save back to localStorage
  localStorage.setItem('appointments', JSON.stringify(updatedAppointments));
  
  return appointment;
};

// Function to get all appointments from localStorage
export const getAppointments = (): AppointmentData[] => {
  const appointmentsString = localStorage.getItem('appointments');
  return appointmentsString ? JSON.parse(appointmentsString) : [];
};

// Function to get appointments for a specific doctor
export const getDoctorAppointments = (doctorId: string): AppointmentData[] => {
  const appointments = getAppointments();
  return appointments.filter(appointment => appointment.doctorId === doctorId);
};

// Function to get appointments for a specific user
export const getUserAppointments = (userId: string): AppointmentData[] => {
  const appointments = getAppointments();
  return appointments.filter(appointment => appointment.userId === userId);
};

// Function to update the status of an appointment
export const updateAppointmentStatus = (appointmentId: string, status: AppointmentStatus): AppointmentData | null => {
  const appointments = getAppointments();
  const appointmentIndex = appointments.findIndex(apt => apt.id === appointmentId);
  
  if (appointmentIndex === -1) {
    return null;
  }
  
  // Update the appointment status
  appointments[appointmentIndex].status = status;
  
  // Save back to localStorage
  localStorage.setItem('appointments', JSON.stringify(appointments));
  
  return appointments[appointmentIndex];
};

// Function to format a date
export const formatAppointmentDate = (dateString: string): string => {
  try {
    const parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
    return format(parsedDate, 'MMMM d, yyyy');
  } catch (error) {
    console.error('Error parsing date:', error);
    return dateString;
  }
};
