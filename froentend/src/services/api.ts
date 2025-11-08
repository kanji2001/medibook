
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Base API configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
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
      console.log('Request with token:', config);
    } else {
      console.log('Request without token');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Clear token and redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('authToken', response.data.token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('authToken');
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/users/profile');
    return response.data.data;
  },
  
  isTokenValid: () => {
    const token = localStorage.getItem('authToken');
    if (!token) return false;
    
    try {
      const decoded: any = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }
};

// Doctor services
export const doctorService = {
  getAllDoctors: async (filters = {}) => {
    const response = await api.get('/doctors', { params: filters });
    return response.data;
  },
  
  getDoctorById: async (id: string) => {
    const response = await api.get(`/doctors/${id}`);
    return response.data;
  },
  
  getDoctorAvailability: async (doctorId: string, date: string) => {
    const response = await api.get(`/doctors/${doctorId}/availability`, {
      params: { date }
    });
    return response.data;
  }
};

// Temporary function exports for compatibility
export const fetchDoctors = async () => {
  return doctorService.getAllDoctors();
};

export const fetchDoctorById = async (id: string) => {
  return doctorService.getDoctorById(id);
};

// Appointment services
export const appointmentService = {
  // Create a new appointment
  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },
  
  // Get appointments for the logged-in user
  getUserAppointments: async () => {
    const response = await api.get('/appointments/user');
    return response.data;
  },
  
  // Get appointments for the logged-in doctor
  getDoctorAppointments: async () => {
    const response = await api.get('/appointments/doctor');
    return response.data;
  },
  
  // Get a specific appointment by ID
  getAppointmentById: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data.data;
  },
  
  // Update the status of an appointment
  updateAppointmentStatus: async (id: string, status: string) => {
    const response = await api.put(`/appointments/${id}/status`, { status });
    return response.data;
  }
};

// Admin services
export const adminService = {
  getAllUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data;
  },

  getAppointments: async () => {
    const response = await api.get('/admin/appointments');
    return response.data;
  },
  
  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data;
  },
  
  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  }
};

export default {
  authService,
  doctorService,
  appointmentService,
  adminService
};
