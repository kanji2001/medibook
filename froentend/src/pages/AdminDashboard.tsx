
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import useAdminStore from '@/stores/adminStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import AdminSidebar from '@/components/admin/AdminSidebar';
import UserStatsGrid from '@/components/admin/UserStatsGrid';
import UserFilters from '@/components/admin/UserFilters';
import UserList from '@/components/admin/UserList';
import AppointmentsPanel from '@/components/admin/AppointmentsPanel';
import ReportsSection from '@/components/admin/ReportsSection';
import SettingsPanel from '@/components/admin/SettingsPanel';
import AddDoctorModal from '@/components/admin/AddDoctorModal';
import type { DoctorPayload } from '@/components/admin/addDoctorFormConfig';
import { AdminSection, UserFilter } from '@/components/admin/types';
import { AdminAppointment, AdminUser } from '@/stores/adminStore';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [activeUserFilter, setActiveUserFilter] = useState<UserFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    users,
    appointments,
    loadingUsers,
    loadingAppointments,
    fetchUsers,
    fetchAppointments,
    createDoctor,
    creatingDoctor,
    approveDoctorApplication,
    rejectDoctorApplication,
    error,
    clearError,
  } = useAdminStore(state => ({
    users: state.users,
    appointments: state.appointments,
    loadingUsers: state.loadingUsers,
    loadingAppointments: state.loadingAppointments,
    fetchUsers: state.fetchUsers,
    fetchAppointments: state.fetchAppointments,
    createDoctor: state.createDoctor,
    creatingDoctor: state.creatingDoctor,
    approveDoctorApplication: state.approveDoctorApplication,
    rejectDoctorApplication: state.rejectDoctorApplication,
    error: state.error,
    clearError: state.clearError,
  }));

  useEffect(() => {
    Promise.all([
      fetchUsers().catch(err =>
        toast({
          title: 'Error',
          description: err?.message || 'Failed to load users.',
          variant: 'destructive',
        }),
      ),
      fetchAppointments().catch(err =>
        toast({
          title: 'Error',
          description: err?.message || 'Failed to load appointments.',
          variant: 'destructive',
        }),
      ),
    ]);
  }, [fetchUsers, fetchAppointments, toast]);

  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      clearError();
    }
  }, [error, toast, clearError]);

  const handleApproveDoctor = async (adminUser: AdminUser) => {
    if (!adminUser.doctorProfile) {
      return handleSampleAction();
    }
    try {
      await approveDoctorApplication(adminUser.doctorProfile.id, adminUser.id);
      toast({
        title: 'Doctor Approved',
        description: 'The doctor has been approved and can now use the platform.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Unable to approve doctor.',
        variant: 'destructive',
      });
    }
  };

  const handleRejectDoctor = async (adminUser: AdminUser) => {
    if (!adminUser.doctorProfile) {
      return handleSampleAction();
    }
    try {
      await rejectDoctorApplication(adminUser.doctorProfile.id, adminUser.id);
      toast({
        title: 'Doctor Application Rejected',
        description: 'The doctor has been notified about the application status.',
        variant: 'destructive',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.message || 'Unable to update doctor status.',
        variant: 'destructive',
      });
    }
  };

  const sampleUsers = useMemo<AdminUser[]>(
    () => [
      {
        id: 'sample-user-1',
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@example.com',
        role: 'doctor',
        status: 'active',
        createdAt: '2025-05-13T00:00:00.000Z',
        doctorProfile: {
          id: 'sample-doctor-1',
          specialty: 'Cardiology',
          experience: 12,
          location: 'New York Medical Center',
          address: '123 Medical Avenue, New York, NY 10001',
          phone: '(212) 555-1234',
          about: 'Experienced cardiologist specializing in preventive cardiac care.',
          applicationStatus: 'approved',
          consultationFee: 200,
        },
      },
      {
        id: 'sample-user-2',
        name: 'Dr. Michael Chen',
        email: 'michael.chen@example.com',
        role: 'doctor',
        status: 'pending',
        createdAt: '2025-05-13T00:00:00.000Z',
        doctorProfile: {
          id: 'sample-doctor-2',
          specialty: 'Dermatology',
          experience: 8,
          location: 'Los Angeles Skin Institute',
          address: '89 Sunset Blvd, Los Angeles, CA 90049',
          phone: '(310) 555-0198',
          about: 'Board-certified dermatologist focused on skincare innovations.',
          applicationStatus: 'pending',
          consultationFee: 180,
        },
      },
      {
        id: 'sample-user-3',
        name: 'Emily Davis',
        email: 'emily.davis@example.com',
        role: 'patient',
        status: 'active',
        createdAt: '2025-04-27T00:00:00.000Z',
      },
      {
        id: 'sample-user-4',
        name: 'Jacob Thompson',
        email: 'jacob.thompson@example.com',
        role: 'patient',
        status: 'active',
        createdAt: '2025-05-01T00:00:00.000Z',
      },
    ],
    [],
  );

  const sampleAppointments = useMemo<AdminAppointment[]>(
    () => [
      {
        id: 'appt-1001',
        patientName: 'Emily Davis',
        doctorName: 'Dr. Sarah Johnson',
        doctorSpecialty: 'Cardiology',
        date: '2025-05-20T14:00:00.000Z',
        status: 'confirmed',
      },
      {
        id: 'appt-1002',
        patientName: 'Jacob Thompson',
        doctorName: 'Dr. Michael Chen',
        doctorSpecialty: 'Dermatology',
        date: '2025-05-22T09:30:00.000Z',
        status: 'pending',
      },
    ],
    [],
  );

  const isSampleUserData = !loadingUsers && users.length === 0;
  const isSampleAppointmentData = !loadingAppointments && appointments.length === 0;

  const hydratedUsers = isSampleUserData ? sampleUsers : users;
  const hydratedAppointments = isSampleAppointmentData ? sampleAppointments : appointments;

  const filteredUsers = useMemo(() => {
    return hydratedUsers.filter(adminUser => {
      const matchesSearch =
        adminUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adminUser.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeUserFilter) {
        case 'patients':
          return adminUser.role === 'patient';
        case 'doctors':
          return adminUser.role === 'doctor' && adminUser.status === 'active';
        case 'pending':
          return adminUser.role === 'doctor' && adminUser.status === 'pending';
        default:
          return true;
      }
    });
  }, [hydratedUsers, searchTerm, activeUserFilter]);

  const totals = useMemo(() => {
    const totalUsers = hydratedUsers.length;
    const totalDoctors = hydratedUsers.filter(
      adminUser => adminUser.role === 'doctor' && adminUser.status === 'active',
    ).length;
    const totalPatients = hydratedUsers.filter(adminUser => adminUser.role === 'patient').length;
    const pendingDoctors = hydratedUsers.filter(
      adminUser => adminUser.role === 'doctor' && adminUser.status === 'pending',
    ).length;
    const totalAppointments = hydratedAppointments.length;

    return { totalUsers, totalDoctors, totalPatients, pendingDoctors, totalAppointments };
  }, [hydratedUsers, hydratedAppointments]);

  const handleStatsFilter = (filter: UserFilter) => {
    setActiveSection('users');
    setActiveUserFilter(filter);
  };

  const handleViewAppointments = () => {
    setActiveSection('appointments');
  };

  const handleSampleAction = () => {
    toast({
      title: 'Sample data',
      description: 'This entry is part of the demo data and cannot be modified.',
    });
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('addDoctor') === '1') {
      setActiveSection('users');
      setIsAddDoctorOpen(true);
      params.delete('addDoctor');
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        { replace: true },
      );
    }
  }, [location.pathname, location.search, navigate]);

  const handleCreateDoctor = async (payload: DoctorPayload) => {
    try {
      await createDoctor(payload);
      toast({
        title: 'Doctor Created',
        description: `${payload.name} has been added successfully.`,
      });
      setIsAddDoctorOpen(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Failed to create doctor.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-24">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            <AdminSidebar
              userName={user?.name}
              userAvatar={user?.avatar}
              onLogout={logout}
              activeSection={activeSection}
              onSectionChange={section => setActiveSection(section)}
            />

            <section className="flex-grow space-y-6">
              {activeSection === 'users' && (
                <>
                  <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <button
                      onClick={() => setIsAddDoctorOpen(true)}
                      className="btn-primary px-4 py-2 text-sm"
                    >
                      Add Doctor
                    </button>
                  </header>

                  <UserStatsGrid
                    totalUsers={totals.totalUsers}
                    totalPatients={totals.totalPatients}
                    totalDoctors={totals.totalDoctors}
                    pendingDoctors={totals.pendingDoctors}
                    totalAppointments={totals.totalAppointments}
                    activeFilter={activeUserFilter}
                    onFilterSelect={handleStatsFilter}
                    onViewAppointments={handleViewAppointments}
                    loading={loadingUsers && hydratedUsers.length === 0}
                  />

                  <UserFilters
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    activeUserFilter={activeUserFilter}
                    onFilterChange={filter => setActiveUserFilter(filter)}
                  />

                  <UserList
                    users={filteredUsers}
                    loading={loadingUsers}
                    onApproveDoctor={isSampleUserData ? handleSampleAction : handleApproveDoctor}
                    onRejectDoctor={isSampleUserData ? handleSampleAction : handleRejectDoctor}
                  />
                </>
              )}

              {activeSection === 'appointments' && (
                <>
                  <header className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Appointment Management</h1>
                  </header>

                  <div className="glass-card rounded-xl p-6">
                    <AppointmentsPanel
                      appointments={hydratedAppointments}
                      loading={loadingAppointments}
                    />
                  </div>
                </>
              )}

              {activeSection === 'reports' && <ReportsSection />}

              {activeSection === 'settings' && <SettingsPanel />}
            </section>
          </div>
        </div>
      </main>
      <Footer />
      <AddDoctorModal
        open={isAddDoctorOpen}
        onClose={() => setIsAddDoctorOpen(false)}
        onSubmit={handleCreateDoctor}
        loading={creatingDoctor}
      />
    </div>
  );
};

export default AdminDashboard;
