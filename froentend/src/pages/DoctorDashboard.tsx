
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorSidebar from '@/components/doctor/DoctorSidebar';
import AppointmentList from '@/components/doctor/AppointmentList';
import AvailabilitySettings from '@/components/doctor/AvailabilitySettings';
import { Availability } from '@/context/AuthContext';
import { appointmentService, AppointmentResponse } from '@/services/appointmentApi';

const DoctorDashboard = () => {
  const { user, updateUserAvailability } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
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

  // Load doctor appointments
  useEffect(() => {
    if (user?.id) {
      fetchAppointments();
    }
  }, [user]);

  const fetchAppointments = async () => {
    try {
      if (!user?.id) return;
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load appointments. Please try again later.',
        variant: 'destructive'
      });
    }
  };

  const handleAvailabilityChange = (newAvailability: Availability) => {
    setAvailability(newAvailability);
    // Update user availability in context and localStorage
    updateUserAvailability(newAvailability);
  };

  const handleAppointmentApprove = async (appointmentId: string) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointmentStatus(appointmentId, 'approved');
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt)
      );
      
      toast({
        title: "Appointment Approved",
        description: `You have approved the appointment with ${updatedAppointment.patientName}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve appointment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleAppointmentReject = async (appointmentId: string) => {
    try {
      const updatedAppointment = await appointmentService.updateAppointmentStatus(appointmentId, 'cancelled');
      
      // Update local state
      setAppointments(prev => 
        prev.map(apt => apt.id === appointmentId ? updatedAppointment : apt)
      );
      
      toast({
        title: "Appointment Rejected",
        description: `You have rejected the appointment with ${updatedAppointment.patientName}.`,
        variant: "destructive"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject appointment. Please try again.",
        variant: "destructive"
      });
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
              {activeTab === 'appointments' && (
                <AppointmentList 
                  doctorId={user?.id || ''} 
                  onApprove={handleAppointmentApprove}
                  onReject={handleAppointmentReject}
                />
              )}

              {activeTab === 'availability' && (
                <AvailabilitySettings 
                  initialAvailability={availability}
                  onAvailabilityChange={handleAvailabilityChange}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DoctorDashboard;
