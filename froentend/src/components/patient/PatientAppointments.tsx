
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Download, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';
import AppointmentStatus from '@/components/ui/AppointmentStatus';
import useAppointmentStore from '@/stores/appointmentStore';
import type { AppointmentResponse } from '@/services/appointmentApi';

interface PatientAppointmentsProps {
  userId: string;
}

const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ userId }) => {
  const { toast } = useToast();
  const { appointments, loadingAppointments, fetchUserAppointments } = useAppointmentStore(
    state => ({
      appointments: state.appointments,
      loadingAppointments: state.loadingAppointments,
      fetchUserAppointments: state.fetchUserAppointments,
    }),
  );

  useEffect(() => {
    const load = async () => {
      try {
        await fetchUserAppointments();
      } catch (err: any) {
        toast({
          title: 'Error',
          description: err?.message || 'Failed to load your appointments. Please try again.',
          variant: 'destructive',
        });
      }
    };

    load();

    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [userId, fetchUserAppointments, toast]);

  const downloadAppointmentSlip = (appointment: AppointmentResponse) => {
    toast({
      title: "Download Started",
      description: "Your appointment slip is being downloaded.",
    });
    
    // Mock PDF generation and download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Your appointment slip has been downloaded.",
      });
    }, 1500);
  };

  const getStatusMessage = (appointment: AppointmentResponse) => {
    if (appointment.status === 'cancelled' && appointment.paymentStatus === 'completed') {
      return {
        type: 'refund',
        message: 'Appointment cancelled by doctor. Refund will be processed within 24-48 hours.'
      };
    }
    return null;
  };

  if (loadingAppointments) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold mb-2">No Appointments</h3>
        <p className="text-muted-foreground">
          You don't have any appointments yet.
        </p>
        <button 
          onClick={() => window.location.href = '/doctors'}
          className="btn-primary mt-6"
        >
          Book an Appointment
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Appointments</h2>
        <button 
          onClick={() => fetchUserAppointments().catch(err => {
            toast({
              title: 'Error',
              description: err?.message || 'Failed to refresh appointments.',
              variant: 'destructive',
            });
          })}
          className="text-sm text-primary hover:underline flex items-center"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {appointments.map(appointment => {
          const statusMessage = getStatusMessage(appointment);
          
          return (
            <div 
              key={appointment.id} 
              className="glass-card rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div>
                  <div className="flex items-start gap-3 mb-3">
                    <AppointmentStatus status={appointment.status as any} />
                    {appointment.paymentStatus === 'completed' && appointment.status !== 'cancelled' && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CreditCard className="h-3 w-3 mr-1" />
                        Paid
                      </span>
                    )}
                    <div>
                      <h3 className="font-semibold">Dr. {appointment.doctorName || 'Unknown'}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty || 'Specialist'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{appointment.date}</span>
                    <span className="mx-1">•</span>
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{appointment.time}</span>
                  </div>
                  
                  {appointment.reason && (
                    <div className="text-sm mb-2">
                      <span className="font-medium">Reason:</span> {appointment.reason}
                    </div>
                  )}
                  
                  {appointment.amount && (
                    <div className="text-sm">
                      <span className="font-medium">Amount:</span> ${(appointment.amount / 100).toFixed(2)}
                      {appointment.paymentMethod && ` (${appointment.paymentMethod})`}
                    </div>
                  )}
                </div>
                
                <div className="mt-4 md:mt-0 flex items-start">
                  {(appointment.status === 'confirmed' || appointment.paymentStatus === 'completed') && 
                   appointment.status !== 'cancelled' && (
                    <button
                      onClick={() => downloadAppointmentSlip(appointment)}
                      className="btn-outline"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download Slip
                    </button>
                  )}
                </div>
              </div>
              
              {statusMessage && statusMessage.type === 'refund' && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-amber-800 font-medium">Refund in Process</p>
                      <p className="text-amber-700 text-sm mt-1">{statusMessage.message}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {appointment.status === 'pending' && (
                <div className="mt-4 py-3 px-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                  <p>Your appointment has been created and payment is confirmed. The doctor will review your appointment shortly.</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PatientAppointments;
