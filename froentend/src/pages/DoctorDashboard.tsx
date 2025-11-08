
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorSidebar from '@/components/doctor/DoctorSidebar';
import AppointmentList from '@/components/doctor/AppointmentList';
import AvailabilitySettings from '@/components/doctor/AvailabilitySettings';
import useAppointmentStore from '@/stores/appointmentStore';
import type { AppointmentResponse } from '@/services/appointmentApi';
import { doctorService } from '@/services/api';
import useAuthStore, { Availability } from '@/stores/authStore';
import type { AuthUser } from '@/stores/authStore';
import DoctorPatientsPanel from '@/components/doctor/dashboard/DoctorPatientsPanel';
import DoctorMessagesPanel from '@/components/doctor/dashboard/DoctorMessagesPanel';
import DoctorEarningsPanel from '@/components/doctor/dashboard/DoctorEarningsPanel';
import DoctorProfilePanel, {
  DoctorProfileFormPayload,
  DoctorProfileFormValues,
} from '@/components/doctor/dashboard/DoctorProfilePanel';

const DEFAULT_AVAILABILITY: Availability = {
  status: 'available',
  workingHours: [
    { day: 'Monday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
    { day: 'Tuesday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
    { day: 'Wednesday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
    { day: 'Thursday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
    { day: 'Friday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
    { day: 'Saturday', isWorking: false, timeSlots: [] },
    { day: 'Sunday', isWorking: false, timeSlots: [] },
  ],
};

const cloneAvailability = (availability: Availability): Availability => ({
  status: availability.status,
  workingHours: availability.workingHours.map(day => ({
    day: day.day,
    isWorking: day.isWorking,
    timeSlots: [...day.timeSlots],
  })),
});

interface DoctorProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  experience: number;
  location: string;
  address: string;
  about: string;
  education: string[];
  languages: string[];
  specializations: string[];
  insurances: string[];
  avatar?: string;
  image?: string;
}

const normalizeBackendAvailability = (availability: any): Availability =>
  cloneAvailability({
    status: availability?.status ?? 'available',
    workingHours: Array.isArray(availability?.workingHours)
      ? availability.workingHours.map((day: any) => ({
          day: day?.day ?? '',
          isWorking: Boolean(day?.isWorking),
          timeSlots: Array.isArray(day?.timeSlots)
            ? day.timeSlots
                .map((slot: any) =>
                  typeof slot === 'string'
                    ? slot
                    : typeof slot === 'object' && slot !== null
                      ? slot.time ?? ''
                      : String(slot),
                )
                .filter(Boolean)
            : [],
        }))
      : cloneAvailability(DEFAULT_AVAILABILITY).workingHours,
  });

const mapDoctorProfile = (
  data: any,
  fallback: { name?: string | null; email?: string | null; phone?: string | null; avatar?: string | null },
): DoctorProfile => ({
  id: data?.id ?? data?._id ?? '',
  name: data?.name ?? fallback.name ?? '',
  email: data?.email ?? fallback.email ?? '',
  phone: data?.phone ?? fallback.phone ?? '',
  specialty: data?.specialty ?? '',
  experience: Number.isFinite(Number(data?.experience)) ? Number(data.experience) : 0,
  location: data?.location ?? '',
  address: data?.address ?? '',
  about: data?.about ?? '',
  education: Array.isArray(data?.education) ? data.education : [],
  languages: Array.isArray(data?.languages) ? data.languages : [],
  specializations: Array.isArray(data?.specializations) ? data.specializations : [],
  insurances: Array.isArray(data?.insurances) ? data.insurances : [],
  avatar: data?.avatar ?? data?.image ?? fallback.avatar ?? '',
  image: data?.image ?? '',
});

const createFallbackProfile = (user: AuthUser | null): DoctorProfile | null => {
  if (!user) return null;
  return {
    id: user.doctorId ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    specialty: user.specialty ?? '',
    experience: 0,
    location: '',
    address: '',
    about: user.bio ?? '',
    education: [],
    languages: [],
    specializations: [],
    insurances: [],
    avatar: user.avatar ?? '',
    image: '',
  };
};

const profileToFormValues = (profile: DoctorProfile): DoctorProfileFormValues => ({
  name: profile.name,
  email: profile.email,
  phone: profile.phone ?? '',
  specialty: profile.specialty ?? '',
  experience: profile.experience != null ? String(profile.experience) : '0',
  location: profile.location ?? '',
  address: profile.address ?? '',
  about: profile.about ?? '',
  education: (profile.education ?? []).join(', '),
  languages: (profile.languages ?? []).join(', '),
  specializations: (profile.specializations ?? []).join(', '),
  insurances: (profile.insurances ?? []).join(', '),
  avatar: profile.avatar ?? '',
  image: profile.image ?? '',
});

const DoctorDashboard = () => {
  const { user, updateUserAvailability } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('appointments');
  const fetchDoctorAppointments = useAppointmentStore(state => state.fetchDoctorAppointments);
  const doctorAppointments = useAppointmentStore(state => state.doctorAppointments);
  const [availability, setAvailability] = useState<Availability>(() =>
    cloneAvailability(DEFAULT_AVAILABILITY),
  );
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(() =>
    createFallbackProfile(user),
  );
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  // Initialize availability from user data if available
  useEffect(() => {
    if (user?.availability) {
      setAvailability(cloneAvailability(user.availability));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    if (!user.doctorId) {
      setDoctorProfile(createFallbackProfile(user));
      return;
    }

    setProfileLoading(true);
    doctorService
      .getDoctorById(user.doctorId)
      .then(data => {
        setDoctorProfile(
          mapDoctorProfile(data, {
            name: user?.name,
            email: user?.email,
            phone: user?.phone,
            avatar: user?.avatar,
          }),
        );
      })
      .catch(error => {
        console.error('Error fetching doctor profile:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your profile details. Showing basic information instead.',
          variant: 'destructive',
        });
        setDoctorProfile(createFallbackProfile(user));
      })
      .finally(() => setProfileLoading(false));
  }, [user, toast]);

  useEffect(() => {
    if (user && !doctorProfile) {
      setDoctorProfile(createFallbackProfile(user));
    }
  }, [user, doctorProfile]);

  const hasFetchedAppointmentsRef = useRef(false);

  useEffect(() => {
    if (!user?.id || hasFetchedAppointmentsRef.current) return;
    hasFetchedAppointmentsRef.current = true;

    fetchDoctorAppointments().catch(error => {
      console.error('Error fetching doctor appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments. Please try again later.',
        variant: 'destructive',
      });
    });
  }, [user?.id, fetchDoctorAppointments, toast]);

  const handleAvailabilityChange = async (newAvailability: Availability) => {
    const payload = {
      status: newAvailability.status,
      workingHours: newAvailability.workingHours.map(day => ({
        day: day.day,
        isWorking: day.isWorking,
        timeSlots: day.timeSlots.map(time => ({ time, isBooked: false })),
      })),
    };

    try {
      const updated = await doctorService.updateAvailability(payload);
      const normalized = normalizeBackendAvailability(updated ?? payload);
      setAvailability(normalized);
      updateUserAvailability(normalized);
    } catch (error) {
      throw error;
    }
  };

  const patientsSummary = useMemo(() => {
    const map = new Map<string, AppointmentResponse>();
    doctorAppointments.forEach(appointment => {
      if (!map.has(appointment.patientEmail)) {
        map.set(appointment.patientEmail, appointment);
      }
    });
    return Array.from(map.values());
  }, [doctorAppointments]);

  const earningsSummary = useMemo(() => {
    return doctorAppointments.reduce(
      (summary, appointment) => {
        summary.totalBookings += 1;
        const status = appointment.status?.toLowerCase() ?? '';

        if (['confirmed', 'approved', 'completed'].includes(status)) {
          summary.confirmed += 1;
        } else if (['cancelled'].includes(status)) {
          summary.cancelled += 1;
        } else if (['pending', 'booked', 'unpaid'].includes(status)) {
          summary.pending += 1;
        } else {
          summary.pending += 1;
        }

        if (appointment.amount) {
          summary.totalRevenue += (appointment.amount ?? 0) / 100;
        }

        return summary;
      },
      { totalBookings: 0, confirmed: 0, pending: 0, cancelled: 0, totalRevenue: 0 },
    );
  }, [doctorAppointments]);

  const handleProfileSave = async (updates: DoctorProfileFormPayload) => {
    setProfileSaving(true);
    try {
      const updated = await doctorService.updateProfile(updates);
      setDoctorProfile(
        mapDoctorProfile(updated, {
          name: updates.name,
          email: user?.email,
          phone: updates.phone ?? user?.phone,
          avatar: updates.avatar ?? user?.avatar,
        }),
      );
      await useAuthStore.getState().initialize();
      toast({
        title: 'Profile Updated',
        description: 'Your profile changes have been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Update Failed',
        description: error?.message || 'We could not update your profile. Please try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setProfileSaving(false);
    }
  };

  const profileFormValues = useMemo(
    () => (doctorProfile ? profileToFormValues(doctorProfile) : null),
    [doctorProfile],
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'appointments':
        return <AppointmentList />;
      case 'availability':
        return (
          <AvailabilitySettings
            initialAvailability={availability}
            onAvailabilityChange={handleAvailabilityChange}
          />
        );
      case 'patients':
        return <DoctorPatientsPanel patients={patientsSummary} />;
      case 'messages':
        return <DoctorMessagesPanel />;
      case 'earnings':
        return <DoctorEarningsPanel summary={earningsSummary} />;
      case 'settings':
        return (
          <DoctorProfilePanel
            profile={profileFormValues}
            loading={profileLoading}
            saving={profileSaving}
            onSave={handleProfileSave}
          />
        );
      default:
        return <AppointmentList />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-24">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <DoctorSidebar 
              activeTab={activeTab} 
              setActiveTab={setActiveTab}
              specialty={doctorProfile?.specialty}
            />
            
            {/* Main Content */}
            <div className="flex-grow">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DoctorDashboard;