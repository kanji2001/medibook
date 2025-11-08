
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import {
  Calendar,
  User,
  Users,
  FileText,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import useAdminStore from '@/stores/adminStore';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'appointments'>('users');
  const [activeUserTab, setActiveUserTab] =
    useState<'all' | 'patients' | 'doctors' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const {
    users,
    appointments,
    loadingUsers,
    loadingAppointments,
    fetchUsers,
    fetchAppointments,
    updateUserRole,
    error,
    clearError,
  } = useAdminStore(state => ({
    users: state.users,
    appointments: state.appointments,
    loadingUsers: state.loadingUsers,
    loadingAppointments: state.loadingAppointments,
    fetchUsers: state.fetchUsers,
    fetchAppointments: state.fetchAppointments,
    updateUserRole: state.updateUserRole,
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

  const handleApproveDoctor = async (userId: string) => {
    try {
      await updateUserRole(userId, 'doctor');
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

  const handleRejectDoctor = async (userId: string) => {
    try {
      await updateUserRole(userId, 'patient');
      toast({
        title: 'Doctor Role Updated',
        description: 'The doctor has been moved back to patient status.',
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

  const filteredUsers = useMemo(() => {
    return users.filter(adminUser => {
      const matchesSearch =
        adminUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        adminUser.email.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      switch (activeUserTab) {
        case 'patients':
          return adminUser.role === 'patient';
        case 'doctors':
          return adminUser.role === 'doctor';
        case 'pending':
          return adminUser.status === 'pending';
        default:
          return true;
      }
    });
  }, [users, searchTerm, activeUserTab]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <div className="flex items-center text-green-600">
            <CheckCircle className="w-4 h-4 mr-1" />
            <span>Active</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center text-yellow-600">
            <Clock className="w-4 h-4 mr-1" />
            <span>Pending</span>
          </div>
        );
      default:
        return null;
    }
  };

  const totalUsers = users.length;
  const totalDoctors = users.filter(adminUser => adminUser.role === 'doctor').length;
  const totalPatients = users.filter(adminUser => adminUser.role === 'patient').length;
  const pendingDoctors = users.filter(adminUser => adminUser.status === 'pending').length;
  const totalAppointments = appointments.length;

  const renderUsersSection = () => {
    if (loadingUsers) {
      return (
        <div className="text-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading users...</p>
        </div>
      );
    }

    if (!filteredUsers.length) {
      return (
        <div className="glass-card rounded-xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No users found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {filteredUsers.map(adminUser => (
          <div key={adminUser.id} className="glass-card rounded-xl p-5 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center uppercase font-semibold text-primary">
                {adminUser.name.charAt(0)}
              </div>

              <div className="flex-grow">
                <div className="flex items-center">
                  <h3 className="font-semibold">{adminUser.name}</h3>
                  <div className="badge badge-outline ml-2 capitalize">{adminUser.role}</div>
                </div>
                <p className="text-sm text-muted-foreground">{adminUser.email}</p>
                <div className="text-xs text-muted-foreground mt-1">
                  Joined{' '}
                  {adminUser.createdAt
                    ? new Date(adminUser.createdAt).toLocaleDateString()
                    : '—'}
                </div>
              </div>

              <div className="md:text-right">
                <div className="mb-2">{getStatusBadge(adminUser.status)}</div>

                {adminUser.status === 'pending' ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveDoctor(adminUser.id)}
                      className="btn-primary py-1 px-3 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectDoctor(adminUser.id)}
                      className="btn-outline py-1 px-3 text-sm text-red-500 border-red-500 hover:bg-red-50"
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button className="btn-outline py-1 px-3 text-sm">View Details</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAppointmentsSection = () => {
    if (loadingAppointments) {
      return (
        <div className="text-center py-10">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      );
    }

    if (!appointments.length) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
          <p className="text-muted-foreground">
            There are no appointments in the system yet.
          </p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-4 font-medium">ID</th>
              <th className="text-left py-2 px-4 font-medium">Patient</th>
              <th className="text-left py-2 px-4 font-medium">Doctor</th>
              <th className="text-left py-2 px-4 font-medium">Date & Time</th>
              <th className="text-left py-2 px-4 font-medium">Status</th>
              <th className="text-right py-2 px-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => {
              const appointmentDate = appointment.date ? new Date(appointment.date) : null;
              return (
                <tr key={appointment.id} className="border-b border-border last:border-none">
                  <td className="py-4 px-4">{appointment.id}</td>
                  <td className="py-4 px-4">{appointment.patientName || '—'}</td>
                  <td className="py-4 px-4">
                    <div>{appointment.doctorName || '—'}</div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.doctorSpecialty || '—'}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div>
                      {appointmentDate
                        ? appointmentDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })
                        : '—'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {appointment.time ||
                        (appointmentDate
                          ? appointmentDate.toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '—')}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div
                      className={`badge ${
                        appointment.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appointment.status
                        ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
                        : 'Unknown'}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="btn-outline py-1 px-3 text-xs">View Details</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow py-24">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64 shrink-0">
              <div className="sticky top-24 space-y-6">
                {/* Profile Summary */}
                <div className="glass-card rounded-xl p-5 text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
                    <img 
                      src={user?.avatar || "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                      alt={user?.name || "Admin"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <div className="badge badge-outline mt-1 mb-4">Admin</div>
                  <button 
                    onClick={logout}
                    className="btn-outline w-full text-sm py-1.5"
                  >
                    Sign Out
                  </button>
                </div>
                
                {/* Navigation */}
                <div className="glass-card rounded-xl overflow-hidden">
                  <nav className="text-sm">
                    <button 
                      onClick={() => setActiveTab('users')}
                      className={`w-full text-left flex items-center py-3 px-4 ${
                        activeTab === 'users' 
                          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                          : 'hover:bg-secondary transition-colors'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-3" />
                      Users
                    </button>
                    <button 
                      onClick={() => setActiveTab('appointments')}
                      className={`w-full text-left flex items-center py-3 px-4 ${
                        activeTab === 'appointments' 
                          ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                          : 'hover:bg-secondary transition-colors'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mr-3" />
                      Appointments
                    </button>
                    <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
                      <FileText className="w-4 h-4 mr-3" />
                      Reports
                    </Link>
                    <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
                      <Settings className="w-4 h-4 mr-3" />
                      Settings
                    </Link>
                  </nav>
                </div>
              </div>
            </div>
            
              {/* Main Content */}
              <div className="flex-grow">
                {activeTab === 'users' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">User Management</h1>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">Total Users</div>
                            <div className="text-2xl font-semibold">{totalUsers}</div>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">Patients</div>
                            <div className="text-2xl font-semibold">{totalPatients}</div>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                            <User className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">Doctors</div>
                            <div className="text-2xl font-semibold">{totalDoctors}</div>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                            <Clock className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">Pending Approvals</div>
                            <div className="text-2xl font-semibold">{pendingDoctors}</div>
                          </div>
                        </div>
                      </div>
                      <div className="glass-card rounded-xl p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                            <Calendar className="w-5 h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-muted-foreground text-sm">Total Appointments</div>
                            <div className="text-2xl font-semibold">{totalAppointments}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={event => setSearchTerm(event.target.value)}
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setActiveUserTab('all')}
                          className={`px-3 py-2 rounded-md ${
                            activeUserTab === 'all'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          All
                        </button>
                        <button
                          onClick={() => setActiveUserTab('patients')}
                          className={`px-3 py-2 rounded-md ${
                            activeUserTab === 'patients'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          Patients
                        </button>
                        <button
                          onClick={() => setActiveUserTab('doctors')}
                          className={`px-3 py-2 rounded-md ${
                            activeUserTab === 'doctors'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          Doctors
                        </button>
                        <button
                          onClick={() => setActiveUserTab('pending')}
                          className={`px-3 py-2 rounded-md ${
                            activeUserTab === 'pending'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                        >
                          Pending
                        </button>
                      </div>
                    </div>

                    {renderUsersSection()}
                  </>
                )}

                {activeTab === 'appointments' && (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold">Appointment Management</h1>
                    </div>

                    <div className="glass-card rounded-xl p-6">{renderAppointmentsSection()}</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
