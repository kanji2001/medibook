import { create } from 'zustand';
import { adminService } from '@/services/api';

export type DoctorApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface AdminDoctorProfile {
  id: string;
  specialty: string;
  experience: number;
  location: string;
  address: string;
  phone: string;
  about: string;
  applicationStatus: DoctorApplicationStatus;
  licenseNumber?: string;
  consultationFee?: number;
  appliedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
  approvalNotes?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending' | 'rejected' | 'suspended';
  createdAt?: string;
  lastLoginAt?: string;
  doctorProfile?: AdminDoctorProfile;
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
  creatingDoctor: boolean;
  updatingUserId: string | null;
  deletingUserId: string | null;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchAppointments: () => Promise<void>;
  updateUserRole: (userId: string, role: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  createDoctor: (doctorData: any) => Promise<any>;
  approveDoctorApplication: (doctorId: string, userId: string, notes?: string) => Promise<void>;
  rejectDoctorApplication: (
    doctorId: string,
    userId: string,
    options?: { reason?: string; notes?: string }
  ) => Promise<void>;
  clearError: () => void;
}

const mapUser = (user: any): AdminUser => {
  const doctorProfile = user.doctorProfile
    ? {
        id: user.doctorProfile._id || user.doctorProfile.id,
        specialty: user.doctorProfile.specialty,
        experience: user.doctorProfile.experience,
        location: user.doctorProfile.location,
        address: user.doctorProfile.address,
        phone: user.doctorProfile.phone,
        about: user.doctorProfile.about,
        applicationStatus:
          user.doctorProfile.applicationStatus ||
          (user.status === 'active' ? 'approved' : 'pending'),
        licenseNumber: user.doctorProfile.licenseNumber,
        consultationFee: user.doctorProfile.consultationFee,
        appliedAt: user.doctorProfile.appliedAt,
        approvedAt: user.doctorProfile.approvedAt,
        rejectionReason: user.doctorProfile.rejectionReason,
        approvalNotes: user.doctorProfile.approvalNotes,
      }
    : undefined;

  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status || 'active',
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    doctorProfile,
  };
};

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
  creatingDoctor: false,
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

  createDoctor: async doctorData => {
    set({ creatingDoctor: true, error: null });
    try {
      const response = await adminService.createDoctor(doctorData);
      const createdDoctor = response?.data || response?.data?.data || response;
      if (!createdDoctor) {
        throw new Error('Failed to create doctor');
      }

      const mappedUser = createdDoctor.user ? mapUser(createdDoctor.user) : null;

      set(state => ({
        users: mappedUser
          ? [
              ...state.users.filter(existing => existing.id !== mappedUser.id),
              mappedUser,
            ]
          : state.users,
        creatingDoctor: false,
      }));

      return createdDoctor;
    } catch (error: any) {
      set({
        creatingDoctor: false,
        error: error?.message || 'Failed to create doctor.',
      });
      throw error;
    }
  },

  approveDoctorApplication: async (doctorId, userId, notes) => {
    try {
      const response = await adminService.approveDoctorApplication(doctorId, { notes });
      const updatedDoctor = response?.data || response?.data?.data || response;
      set(state => ({
        users: state.users.map(user => {
          if (user.id !== userId) return user;
          const updatedProfile: AdminDoctorProfile | undefined = user.doctorProfile
            ? {
                ...user.doctorProfile,
                applicationStatus: 'approved',
                approvedAt: updatedDoctor?.approvedAt || new Date().toISOString(),
                approvalNotes: notes || user.doctorProfile.approvalNotes,
              }
            : undefined;
          return {
            ...user,
            status: 'active',
            doctorProfile: updatedProfile,
          };
        }),
      }));
    } catch (error: any) {
      set({
        error: error?.message || 'Failed to approve doctor application.',
      });
      throw error;
    }
  },

  rejectDoctorApplication: async (doctorId, userId, options) => {
    try {
      const response = await adminService.rejectDoctorApplication(doctorId, options);
      const updatedDoctor = response?.data || response?.data?.data || response;
      set(state => ({
        users: state.users.map(user => {
          if (user.id !== userId) return user;
          const updatedProfile: AdminDoctorProfile | undefined = user.doctorProfile
            ? {
                ...user.doctorProfile,
                applicationStatus: 'rejected',
                rejectionReason: options?.reason || user.doctorProfile.rejectionReason,
                approvalNotes: options?.notes || user.doctorProfile.approvalNotes,
              }
            : undefined;
          return {
            ...user,
            status: 'rejected',
            doctorProfile: updatedProfile,
          };
        }),
      }));
      return updatedDoctor;
    } catch (error: any) {
      set({
        error: error?.message || 'Failed to reject doctor application.',
      });
      throw error;
    }
  },
}));

export default useAdminStore;

