
import { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorSidebar from '@/components/doctor/DoctorSidebar';
import AppointmentList from '@/components/doctor/AppointmentList';
import AvailabilitySettings from '@/components/doctor/AvailabilitySettings';
import { Availability } from '@/context/AuthContext';
import useAppointmentStore from '@/stores/appointmentStore';
import type { AppointmentResponse } from '@/services/appointmentApi';

const DoctorDashboard = () => {
  const { user, updateUserAvailability } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('appointments');
  const fetchDoctorAppointments = useAppointmentStore(state => state.fetchDoctorAppointments);
  const doctorAppointments = useAppointmentStore(state => state.doctorAppointments);
  const [availability, setAvailability] = useState<Availability>({
    status: 'available',
    workingHours: [
      { day: 'Monday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Tuesday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Wednesday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Thursday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Friday', isWorking: true, timeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM'] },
      { day: 'Saturday', isWorking: false, timeSlots: [] },
      { day: 'Sunday', isWorking: false, timeSlots: [] },
    ]
  });

  // Initialize availability from user data if available
  useEffect(() => {
    if (user?.availability) {
      setAvailability(user.availability);
    }
  }, [user]);

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

  const handleAvailabilityChange = (newAvailability: Availability) => {
    setAvailability(newAvailability);
    // Update user availability in context and localStorage
    updateUserAvailability(newAvailability);
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
    const totalBookings = doctorAppointments.length;
    const confirmed = doctorAppointments.filter(a => a.status === 'confirmed').length;
    const pending = doctorAppointments.filter(a => a.status === 'pending').length;
    const cancelled = doctorAppointments.filter(a => a.status === 'cancelled').length;
    const totalRevenue = doctorAppointments.reduce((sum, appointment) => {
      return sum + (appointment.amount ?? 0);
    }, 0);
    return { totalBookings, confirmed, pending, cancelled, totalRevenue };
  }, [doctorAppointments]);

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
        return <SettingsPanel doctorName={user?.name ?? 'Doctor'} />;
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

const SettingsPanel = ({ doctorName }: { doctorName: string }) => (
  <div className="glass-card rounded-xl p-6 space-y-4">
    <h2 className="text-xl font-semibold">Profile & Settings</h2>
    <p className="text-sm text-muted-foreground">
      Basic settings editing hasn&apos;t been built yet. In the meantime, contact the admin team to
      update your profile information, or adjust your availability from the sidebar.
    </p>
    <div className="rounded-lg border border-border p-4 text-sm">
      <p className="font-semibold mb-1">{doctorName}</p>
      <p className="text-muted-foreground">
        Keep your contact information up to date so patients can reach you with ease.
      </p>
    </div>
  </div>
);
