import { create } from 'zustand';
import {
  appointmentService,
  AppointmentRequest,
  AppointmentResponse,
} from '@/services/appointmentApi';

type AppointmentId = string;

interface AppointmentState {
  appointments: AppointmentResponse[];
  doctorAppointments: AppointmentResponse[];
  currentAppointment: AppointmentResponse | null;
  loadingAppointments: boolean;
  loadingDoctorAppointments: boolean;
  creatingAppointment: boolean;
  processingPayment: boolean;
  error: string | null;
  createAppointment: (payload: AppointmentRequest) => Promise<AppointmentResponse>;
  fetchUserAppointments: () => Promise<void>;
  fetchDoctorAppointments: () => Promise<void>;
  updateAppointmentStatus: (id: AppointmentId, status: string) => Promise<AppointmentResponse>;
  processPayment: (
    appointmentId: AppointmentId,
    paymentMethod: string,
    paymentData?: Record<string, unknown>,
  ) => Promise<any>;
  getAppointmentById: (id: AppointmentId) => Promise<AppointmentResponse | null>;
  getPaymentStatus: (id: AppointmentId) => Promise<any>;
  clearError: () => void;
}

const mergeAppointment = (
  list: AppointmentResponse[],
  updated: AppointmentResponse,
): AppointmentResponse[] =>
  list.map(appointment => (appointment.id === updated.id ? { ...appointment, ...updated } : appointment));

const upsertAppointment = (
  list: AppointmentResponse[],
  item: AppointmentResponse,
): AppointmentResponse[] => {
  const index = list.findIndex(appointment => appointment.id === item.id);
  if (index === -1) {
    return [item, ...list];
  }

  const copy = [...list];
  copy[index] = { ...copy[index], ...item };
  return copy;
};

const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  doctorAppointments: [],
  currentAppointment: null,
  loadingAppointments: false,
  loadingDoctorAppointments: false,
  creatingAppointment: false,
  processingPayment: false,
  error: null,

  clearError: () => set({ error: null }),

  createAppointment: async payload => {
    set({ creatingAppointment: true, error: null });
    try {
      const response = await appointmentService.createAppointment(payload);
      const appointment = response?.data ?? response;

      set(state => ({
        creatingAppointment: false,
        currentAppointment: appointment,
        appointments: upsertAppointment(state.appointments, appointment),
      }));

      return appointment;
    } catch (error: any) {
      const message = error?.message || 'Failed to create appointment';
      set({ creatingAppointment: false, error: message });
      throw error;
    }
  },

  fetchUserAppointments: async () => {
    set({ loadingAppointments: true, error: null });
    try {
      const data = await appointmentService.getUserAppointments();
      set({
        appointments: data,
        loadingAppointments: false,
      });
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch appointments';
      set({
        loadingAppointments: false,
        error: message,
      });
      throw error;
    }
  },

  fetchDoctorAppointments: async () => {
    set({ loadingDoctorAppointments: true, error: null });
    try {
      const data = await appointmentService.getDoctorAppointments();
      set({
        doctorAppointments: data,
        loadingDoctorAppointments: false,
      });
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch doctor appointments';
      set({
        loadingDoctorAppointments: false,
        error: message,
      });
      throw error;
    }
  },

  updateAppointmentStatus: async (id, status) => {
    set({ error: null });
    try {
      const updated = await appointmentService.updateAppointmentStatus(id, status);
      set(state => ({
        appointments: mergeAppointment(state.appointments, updated),
        doctorAppointments: mergeAppointment(state.doctorAppointments, updated),
        currentAppointment:
          state.currentAppointment && state.currentAppointment.id === id
            ? { ...state.currentAppointment, ...updated }
            : state.currentAppointment,
      }));
      return updated;
    } catch (error: any) {
      const message = error?.message || 'Failed to update appointment status';
      set({ error: message });
      throw error;
    }
  },

  processPayment: async (appointmentId, paymentMethod, paymentData) => {
    set({ processingPayment: true, error: null });
    try {
      const response = await appointmentService.processPayment(
        appointmentId,
        paymentMethod,
        paymentData,
      );

      const updatedAppointment = response?.data ?? response;

      set(state => ({
        processingPayment: false,
        appointments: mergeAppointment(state.appointments, updatedAppointment),
        doctorAppointments: mergeAppointment(state.doctorAppointments, updatedAppointment),
        currentAppointment:
          state.currentAppointment && state.currentAppointment.id === appointmentId
            ? { ...state.currentAppointment, ...updatedAppointment }
            : state.currentAppointment,
      }));

      return response;
    } catch (error: any) {
      const message = error?.message || 'Failed to process payment';
      set({ processingPayment: false, error: message });
      throw error;
    }
  },

  getAppointmentById: async id => {
    set({ error: null });
    try {
      const appointment = await appointmentService.getAppointmentById(id);
      set(state => ({
        currentAppointment: appointment,
        appointments: upsertAppointment(state.appointments, appointment),
        doctorAppointments: upsertAppointment(state.doctorAppointments, appointment),
      }));
      return appointment;
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch appointment details';
      set({ error: message });
      throw error;
    }
  },

  getPaymentStatus: async id => {
    set({ error: null });
    try {
      return await appointmentService.getPaymentStatus(id);
    } catch (error: any) {
      const message = error?.message || 'Failed to fetch payment status';
      set({ error: message });
      throw error;
    }
  },
}));

export default useAppointmentStore;

