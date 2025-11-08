import { create } from 'zustand';
import { jwtDecode } from 'jwt-decode';
import { authService } from '@/services/api';

export type UserRole = 'patient' | 'doctor' | 'admin';

export interface Availability {
  status: 'available' | 'unavailable' | 'limited';
  workingHours: {
    day: string;
    isWorking: boolean;
    timeSlots: string[];
  }[];
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  availability?: Availability;
  doctorId?: string;
  phone?: string;
  specialty?: string;
  bio?: string;
  status?: 'active' | 'pending' | 'rejected' | 'suspended';
  applicationStatus?: 'pending' | 'approved' | 'rejected';
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: UserRole | 'patient' | 'doctor';
  phone?: string;
  specialty?: string;
  experience?: number;
  location?: string;
  address?: string;
  about?: string;
  education?: string[] | string;
  languages?: string[] | string;
  specializations?: string[] | string;
  insurances?: string[] | string;
  avatar?: string;
  licenseNumber?: string;
  consultationFee?: number;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (
    payload: RegisterPayload
  ) => Promise<{ success: boolean; awaitingApproval?: boolean; message?: string }>;
  logout: () => void;
  updateUserAvailability: (availability: Availability) => void;
}

const decodeToken = (token: string): Partial<AuthUser> | null => {
  try {
    const decoded: any = jwtDecode(token);
    return {
      id: decoded.userId,
      name: decoded.name,
      email: decoded.email,
      role: decoded.role,
      avatar: decoded.avatar,
    };
  } catch (error) {
    console.error('Failed to decode token', error);
    return null;
  }
};

const fetchCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const profile = await authService.getCurrentUser();
    return {
      id: profile.id || profile._id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      avatar: profile.avatar,
      phone: profile.phone,
      doctorId: profile.doctorId,
      specialty: profile.specialty,
    bio: profile.bio,
      availability: profile.availability,
      status: profile.status,
      applicationStatus: profile.applicationStatus,
    };
  } catch (error) {
    console.error('Failed to fetch current user', error);
    return null;
  }
};

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      set({ initialized: true });
      return;
    }

    const decoded = decodeToken(token);
    if (!decoded) {
      authService.logout();
      set({ initialized: true });
      return;
    }

    if (!authService.isTokenValid()) {
      authService.logout();
      set({ initialized: true });
      return;
    }

    const profile = await fetchCurrentUser();
    if (profile) {
      set({
        user: profile,
        isAuthenticated: true,
        initialized: true,
      });
    } else {
      authService.logout();
      set({
        user: null,
        isAuthenticated: false,
        initialized: true,
      });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authService.login(email, password);
      if (!response.success || !response.token) {
        throw new Error(response.message || 'Login failed');
      }

      const decoded = decodeToken(response.token);
      let user = decoded ? (decoded as AuthUser) : null;

      const profile = await fetchCurrentUser();
      if (profile) {
        user = profile;
      }

      set({
        user: user ?? null,
        isAuthenticated: Boolean(user),
        loading: false,
        error: null,
      });

      return { success: Boolean(user), role: user?.role };
    } catch (error: any) {
      console.error('Login error:', error);
      set({
        loading: false,
        error: error.response?.data?.message || error.message || 'Login failed',
      });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed',
      };
    }
  },

  register: async payload => {
    set({ loading: true, error: null });
    try {
      const response = await authService.register({
        name: payload.name,
        email: payload.email,
        password: payload.password,
        role: payload.role,
        phone: payload.phone,
        specialty: payload.specialty,
        experience: payload.experience,
        location: payload.location,
        address: payload.address,
        about: payload.about,
        education: payload.education,
        languages: payload.languages,
        specializations: payload.specializations,
        insurances: payload.insurances,
        avatar: payload.avatar,
        licenseNumber: payload.licenseNumber,
        consultationFee: payload.consultationFee,
      });

      const awaitingApproval = Boolean(response.awaitingApproval);
      let user: AuthUser | null = null;

      if (response.token) {
        const decoded = decodeToken(response.token);
        user = decoded ? (decoded as AuthUser) : null;

        const profile = await fetchCurrentUser();
        if (profile) {
          user = profile;
        }
      }

      set({
        user: user ?? null,
        isAuthenticated: Boolean(user),
        loading: false,
        error: null,
      });

      return { success: true, awaitingApproval };
    } catch (error: any) {
      console.error('Registration error:', error);
      set({
        loading: false,
        error: error.response?.data?.message || error.message || 'Registration failed',
      });
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed',
      };
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
  },

  updateUserAvailability: (availability: Availability) => {
    const { user } = get();
    if (user) {
      const updatedUser: AuthUser = { ...user, availability };
      set({ user: updatedUser });
    }
  },
}));

export default useAuthStore;

