
import { useState, useEffect, useMemo, useRef, ChangeEvent, FormEvent } from 'react';
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

interface DoctorProfileUpdatePayload {
  name: string;
  avatar?: string;
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
    if (!user?.doctorId) {
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
  }, [user?.doctorId, user?.name, user?.email, user?.phone, user?.avatar, toast]);

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

  const handleProfileSave = async (updates: DoctorProfileUpdatePayload) => {
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
        return <PatientsPanel patients={patientsSummary} />;
      case 'messages':
        return <MessagesPanel />;
      case 'earnings':
        return <EarningsPanel summary={earningsSummary} />;
      case 'settings':
        return (
          <SettingsPanel
            profile={doctorProfile}
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

interface PatientsPanelProps {
  patients: AppointmentResponse[];
}

const PatientsPanel = ({ patients }: PatientsPanelProps) => {
  if (!patients.length) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">No patients yet</h2>
        <p className="text-muted-foreground text-sm">
          Once appointments are booked, you’ll see a list of unique patients here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patients</h2>
        <span className="text-sm text-muted-foreground">{patients.length} total</span>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/40">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="py-3 px-4 font-medium">Patient</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Phone</th>
              <th className="py-3 px-4 font-medium">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.patientEmail} className="border-t border-border">
                <td className="py-3 px-4 font-medium">{patient.patientName}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{patient.patientEmail}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{patient.patientPhone || '—'}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {patient.date
                    ? new Date(patient.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const MessagesPanel = () => (
  <div className="glass-card rounded-xl p-6 space-y-3">
    <h2 className="text-xl font-semibold">Messages</h2>
    <p className="text-sm text-muted-foreground">
      Messaging tools are coming soon. For now, you can contact patients using the email and phone
      details in your appointments.
    </p>
  </div>
);

interface EarningsPanelProps {
  summary: {
    totalBookings: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    totalRevenue: number;
  };
}

const EarningsPanel = ({ summary }: EarningsPanelProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold">Earnings Overview</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard title="Total Bookings" value={summary.totalBookings} />
      <StatCard title="Confirmed" value={summary.confirmed} />
      <StatCard title="Pending" value={summary.pending} />
      <StatCard title="Cancelled" value={summary.cancelled} />
    </div>
    <div className="glass-card rounded-xl p-6">
      <h3 className="text-lg font-semibold">Estimated Revenue</h3>
      <p className="text-2xl font-bold mt-2">
        ${summary.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Revenue is calculated from appointment amounts that include payment information.
      </p>
    </div>
  </div>
);

const StatCard = ({ title, value }: { title: string; value: number }) => (
  <div className="glass-card rounded-xl p-5">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

interface SettingsPanelProps {
  profile: DoctorProfile | null;
  loading: boolean;
  saving: boolean;
  onSave: (updates: DoctorProfileUpdatePayload) => Promise<void>;
}

interface DoctorProfileFormState {
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  location: string;
  address: string;
  about: string;
  education: string;
  languages: string;
  specializations: string;
  insurances: string;
  avatar: string;
  image: string;
}

const SettingsPanel = ({ profile, loading, saving, onSave }: SettingsPanelProps) => {
  const [formValues, setFormValues] = useState<DoctorProfileFormState>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    experience: '',
    location: '',
    address: '',
    about: '',
    education: '',
    languages: '',
    specializations: '',
    insurances: '',
    avatar: '',
    image: '',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setFormValues({
      name: profile.name,
      email: profile.email,
      phone: profile.phone ?? '',
      specialty: profile.specialty ?? '',
      experience: String(profile.experience ?? 0),
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
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [profile]);

  const splitList = (value: string) =>
    value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: DoctorProfileUpdatePayload = {
      name: formValues.name.trim(),
      avatar: formValues.avatar.trim() || undefined,
      phone: formValues.phone.trim() || undefined,
      specialty: formValues.specialty.trim(),
      experience: Number(formValues.experience) || 0,
      location: formValues.location.trim(),
      address: formValues.address.trim(),
      about: formValues.about.trim(),
      education: splitList(formValues.education),
      languages: splitList(formValues.languages),
      specializations: splitList(formValues.specializations),
      insurances: splitList(formValues.insurances),
      image: formValues.image.trim() || undefined,
    };

    try {
      await onSave(payload);
      setSuccessMessage('Profile updated successfully.');
    } catch (error: any) {
      setErrorMessage(error?.message || 'Failed to update profile. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-2">Profile & Settings</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load your profile details right now. Please try refreshing the page.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Profile & Settings</h2>
          <p className="text-sm text-muted-foreground">
            Keep your practice details up to date. These details appear to patients when they view your
            profile.
          </p>
        </div>
        {(formValues.avatar || profile.avatar) && (
          <img
            src={formValues.avatar || profile.avatar}
            alt={profile.name}
            className="h-20 w-20 rounded-full border border-border object-cover"
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Full Name</span>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Email</span>
            <input
              type="email"
              name="email"
              value={formValues.email}
              readOnly
              className="w-full rounded-md border border-border bg-muted px-3 py-2 text-muted-foreground"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Phone</span>
            <input
              type="tel"
              name="phone"
              value={formValues.phone}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="(555) 123-4567"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Specialty</span>
            <input
              type="text"
              name="specialty"
              value={formValues.specialty}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              required
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Years of Experience</span>
            <input
              type="number"
              min="0"
              name="experience"
              value={formValues.experience}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Practice Location</span>
            <input
              type="text"
              name="location"
              value={formValues.location}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </label>
        </div>

        <label className="space-y-1 text-sm block">
          <span className="font-medium">Clinic Address</span>
          <input
            type="text"
            name="address"
            value={formValues.address}
            onChange={handleChange}
            className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </label>

        <label className="space-y-1 text-sm block">
          <span className="font-medium">About</span>
          <textarea
            name="about"
            value={formValues.about}
            onChange={handleChange}
            className="w-full min-h-[120px] rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Describe your background, specialties, and approach to patient care."
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Education</span>
            <textarea
              name="education"
              value={formValues.education}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Separate entries with commas"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Languages</span>
            <input
              type="text"
              name="languages"
              value={formValues.languages}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="English, Spanish"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Specializations</span>
            <input
              type="text"
              name="specializations"
              value={formValues.specializations}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Cardiac Imaging, Heart Failure"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Insurances Accepted</span>
            <input
              type="text"
              name="insurances"
              value={formValues.insurances}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Aetna, Blue Cross, Cigna"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Profile Image URL</span>
            <input
              type="url"
              name="avatar"
              value={formValues.avatar}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="https://..."
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Cover Image URL</span>
            <input
              type="url"
              name="image"
              value={formValues.image}
              onChange={handleChange}
              className="w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="https://..."
            />
          </label>
        </div>

        {errorMessage && <p className="text-sm text-destructive">{errorMessage}</p>}
        {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary px-4 py-2 text-sm"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <span className="text-xs text-muted-foreground">
            Changes are saved instantly and visible to patients.
          </span>
        </div>
      </form>
    </div>
  );
};
