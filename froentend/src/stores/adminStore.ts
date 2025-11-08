import { create } from 'zustand';
import { adminService } from '@/services/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
  createdAt?: string;
  lastLoginAt?: string;
}

export interface AdminAppointment {
  id: string;
  patientId?: string;
  patientName?: string;
  patientEmail?: string;
  doctorId?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  date?: string;
  time?: string;
  status?: string;
}

interface AdminState {
  users: AdminUser[];
  appointments: AdminAppointment[];
  loadingUsers: boolean;
  loadingAppointments: boolean;
  updatingUserId: string | null;
  deletingUserId: string | null;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  clearError: () => void;
}

const mapUser = (user: any): AdminUser => ({
  id: user._id || user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status || (user.role === 'pending' ? 'pending' : 'active'),
  createdAt: user.createdAt,
  lastLoginAt: user.lastLoginAt,
});

const mapAppointment = (appointment: any): AdminAppointment => ({
  id: appointment._id || appointment.id,
  patientId: appointment.userId?._id || appointment.patientId,
  patientName: appointment.userId?.name || appointment.patientName,
  patientEmail: appointment.userId?.email || appointment.patientEmail,
  doctorId: appointment.doctorId?._id || appointment.doctorId,
  doctorName: appointment.doctorId?.user?.name || appointment.doctorName,
  doctorSpecialty: appointment.doctorId?.specialty || appointment.specialty,
  date: appointment.date,
  time: appointment.time,
  status: appointment.status,
});

const useAdminStore = create<AdminState>((set, get) => ({
  users: [],
  appointments: [],
  loadingUsers: false,
  loadingAppointments: false,
  updatingUserId: null,
  deletingUserId: null,
  error: null,

  clearError: () => set({ error: null }),

  fetchUsers: async () => {
    set({ loadingUsers: true, error: null });
    try {
      const response = await adminService.getAllUsers();
      const users = Array.isArray(response?.data) ? response.data : response?.data?.data;
      if (!Array.isArray(users)) {
        throw new Error('Invalid users response');
      }

      set({ users: users.map(mapUser), loadingUsers: false });
    } catch (error: any) {
      set({
        loadingUsers: false,
        error: error?.message || 'Failed to load users.',
      });
      throw error;
    }
  },

  fetchAppointments: async () => {
    set({ loadingAppointments: true, error: null });
    try {
      const response = await adminService.getAppointments();
      const appointments = Array.isArray(response?.data)
        ? response.data
        : response?.data?.data;
      if (!Array.isArray(appointments)) {
        throw new Error('Invalid appointments response');
      }

      set({
        appointments: appointments.map(mapAppointment),
        loadingAppointments: false,
      });
    } catch (error: any) {
      set({
        loadingAppointments: false,
        error: error?.message || 'Failed to load appointments.',
      });
      throw error;
    }
  },

  updateUserRole: async (userId, role) => {
    set({ updatingUserId: userId, error: null });
    try {
      const response = await adminService.updateUser(userId, { role });
      const updatedUser = response?.data || response?.data?.data;
      if (!updatedUser) {
        throw new Error('Failed to update user');
      }

      set(state => ({
        users: state.users.map(user =>
          user.id === userId
            ? mapUser(updatedUser)
            : user
        ),
        updatingUserId: null,
      }));
    } catch (error: any) {
      set({
        updatingUserId: null,
        error: error?.message || 'Failed to update user role.',
      });
      throw error;
    }
  },

  deleteUser: async userId => {
    set({ deletingUserId: userId, error: null });
    try {
      await adminService.deleteUser(userId);
      set(state => ({
        users: state.users.filter(user => user.id !== userId),
        deletingUserId: null,
      }));
    } catch (error: any) {
      set({
        deletingUserId: null,
        error: error?.message || 'Failed to delete user.',
      });
      throw error;
    }
  },
}));

export default useAdminStore;

