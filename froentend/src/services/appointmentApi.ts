
import axios from 'axios';

// Types for appointment-related data
export interface AppointmentRequest {
  doctorId: string;
  date: string;
  time: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reason: string;
  notes?: string;
}

export interface AppointmentResponse {
  id: string;
  doctorId: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  reason: string;
  date: string;
  time: string;
  status: string;
  notes?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  amount?: number;
  createdAt: string;
  // Doctor fields populated from backend
  doctorName?: string;
  doctorSpecialty?: string;
  doctorImage?: string;
}

// Create axios instance with the base URL and auth token
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Appointment service functions
export const appointmentService = {
  // Create a new appointment
  createAppointment: async (appointmentData: AppointmentRequest): Promise<any> => {
    try {
      console.log('Sending appointmentData:', appointmentData);
      const response = await api.post('/appointments', appointmentData);
      console.log('Appointment created:', response);
      return response.data;
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      throw new Error(error.response?.data?.message || 'Failed to create appointment');
    }
  },
  
  // Get user appointments (patient view)
  getUserAppointments: async (): Promise<AppointmentResponse[]> => {
    try {
      const response = await api.get('/appointments/user');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user appointments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },
  
  // Get doctor appointments (doctor view)
  getDoctorAppointments: async (): Promise<AppointmentResponse[]> => {
    try {
      const response = await api.get('/appointments/doctor');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching doctor appointments:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointments');
    }
  },
  
  // Update appointment status (approve/reject)
  updateAppointmentStatus: async (id: string, status: string): Promise<AppointmentResponse> => {
    try {
      const response = await api.put(`/appointments/status/${id}`, { status });
      return response.data;
    } catch (error: any) {
      console.error('Error updating appointment status:', error);
      throw new Error(error.response?.data?.message || 'Failed to update appointment status');
    }
  },
  
  // Process payment for an appointment
  processPayment: async (appointmentId: string, paymentMethod: string): Promise<any> => {
    try {
      const response = await api.post(`/appointments/${appointmentId}/pay`, { 
        paymentMethod 
      });
      return response.data;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      throw new Error(error.response?.data?.message || 'Failed to process payment');
    }
  },
  
  // Check payment status for an appointment
  getPaymentStatus: async (appointmentId: string): Promise<any> => {
    try {
      const response = await api.get(`/appointments/${appointmentId}/payment-status`);
      return response.data;
    } catch (error: any) {
      console.error('Error checking payment status:', error);
      throw new Error(error.response?.data?.message || 'Failed to check payment status');
    }
  },
  
  // Get appointment details by ID
  getAppointmentById: async (id: string): Promise<AppointmentResponse> => {
    try {
      const response = await api.get(`/appointments/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching appointment details:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch appointment details');
    }
  }
};
