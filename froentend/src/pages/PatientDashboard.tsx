
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Calendar, Clock, User, FileText, MessageSquare, Settings } from 'lucide-react';
import { appointmentService } from '@/services/api';
import AppointmentStatus from '@/components/ui/AppointmentStatus';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const userAppointments = await appointmentService.getUserAppointments();
        const sorted = [...userAppointments].sort((a, b) => 
          new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime()
        );
        setAppointments(sorted);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load your appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [user]);

  const filteredAppointments = appointments.filter(apt => {
    const now = new Date();
    const aptDate = new Date(apt.date + ' ' + apt.time);
    
    if (activeTab === 'upcoming') {
      return aptDate > now && apt.status !== 'cancelled';
    } else if (activeTab === 'past') {
      return aptDate < now || apt.status === 'completed';
    }
    return true;
  });

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
                      src={user?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"}
                      alt={user?.name || "User"} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{user?.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{user?.email}</p>
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
                    <Link to="/patient-dashboard" className="flex items-center py-3 px-4 bg-primary/10 text-primary border-l-2 border-primary">
                      <Calendar className="w-4 h-4 mr-3" />
                      Appointments
                    </Link>
                    <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
                      <FileText className="w-4 h-4 mr-3" />
                      Medical Records
                    </Link>
                    <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
                      <MessageSquare className="w-4 h-4 mr-3" />
                      Messages
                    </Link>
                    <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
                      <User className="w-4 h-4 mr-3" />
                      Profile
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
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">My Appointments</h1>
                <Link to="/appointment" className="btn-primary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Book New Appointment
                </Link>
              </div>
              
              {/* Tabs */}
              <div className="border-b border-border mb-6">
                <div className="flex space-x-6">
                  <button
                    onClick={() => setActiveTab('upcoming')}
                    className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                      activeTab === 'upcoming'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button
                    onClick={() => setActiveTab('past')}
                    className={`pb-3 px-1 font-medium transition-colors border-b-2 ${
                      activeTab === 'past'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Past
                  </button>
                </div>
              </div>
              
              {/* Appointments List */}
              {loading ? (
                <div className="text-center py-20">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-muted-foreground">Loading appointments...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 glass-card rounded-xl">
                  <h3 className="text-lg font-semibold mb-2">Error</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn-outline"
                  >
                    Try Again
                  </button>
                </div>
              ) : filteredAppointments.length > 0 ? (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <div key={appointment.id} className="glass-card rounded-xl p-5 animate-fade-in">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden">
                          <img 
                            src={appointment.doctorImage} 
                            alt={appointment.doctorName} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-grow">
                          <h3 className="font-semibold">{appointment.doctorName}</h3>
                          <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                          <div className="flex items-center mt-1 text-sm">
                            <Calendar className="w-4 h-4 mr-1 text-primary" />
                            <span>{new Date(appointment.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                            <span className="mx-2">•</span>
                            <Clock className="w-4 h-4 mr-1 text-primary" />
                            <span>{appointment.time}</span>
                          </div>
                        </div>
                        
                        <div className="md:text-right">
                          <div className="mb-2">
                            <AppointmentStatus status={appointment.status} />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Link 
                              to={`/doctors/${appointment.doctorId}`} 
                              className="btn-outline py-1 px-3 text-sm"
                            >
                              View Doctor
                            </Link>
                            {appointment.status === 'confirmed' && (
                              <button className="btn-primary py-1 px-3 text-sm">
                                Start Consultation
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {appointment.notes && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Notes:</span> {appointment.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-card rounded-xl p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No {activeTab} appointments</h3>
                  <p className="text-muted-foreground mb-6">
                    {activeTab === 'upcoming' 
                      ? "You don't have any upcoming appointments scheduled." 
                      : "You don't have any past appointment records."}
                  </p>
                  <Link to="/appointment" className="btn-primary">
                    Book an Appointment
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PatientDashboard;
