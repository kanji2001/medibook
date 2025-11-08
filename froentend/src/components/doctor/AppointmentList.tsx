
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, X, AlertTriangle } from 'lucide-react';
import { appointmentService, AppointmentResponse } from '@/services/appointmentApi';
import AppointmentStatus from '@/components/ui/AppointmentStatus';

interface AppointmentListProps {
  doctorId: string;
  onApprove: (appointmentId: string) => Promise<void>;
  onReject: (appointmentId: string) => Promise<void>;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  doctorId, 
  onApprove, 
  onReject 
}) => {
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
    
    // Set up polling for real-time updates
    const interval = setInterval(fetchAppointments, 5000);
    return () => clearInterval(interval);
  }, [doctorId]);

  const fetchAppointments = async () => {
    try {
      const data = await appointmentService.getDoctorAppointments();
      setAppointments(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load appointments. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);
      await onApprove(appointmentId);
      await fetchAppointments(); // Refresh the list
      
      toast({
        title: "Appointment Approved",
        description: "The appointment has been approved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve appointment.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appointmentId: string, appointment: AppointmentResponse) => {
    try {
      setActionLoading(appointmentId);
      await onReject(appointmentId);
      await fetchAppointments(); // Refresh the list
      
      const refundMessage = appointment.paymentStatus === 'completed' 
        ? "The appointment has been rejected and a refund will be processed within 24-48 hours."
        : "The appointment has been rejected.";
      
      toast({
        title: "Appointment Rejected",
        description: refundMessage,
        variant: "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject appointment.",
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">No Appointments</h3>
        <p className="text-muted-foreground">
          You don't have any appointments scheduled yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Appointments</h2>
        <button 
          onClick={fetchAppointments}
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {appointments.map(appointment => (
          <div 
            key={appointment.id} 
            className="glass-card rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-grow">
                <div className="flex items-start gap-3 mb-4">
                  <AppointmentStatus status={appointment.status as any} />
                  {appointment.paymentStatus === 'completed' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-lg font-semibold mb-2">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      {appointment.patientName}
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        {appointment.patientEmail}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2" />
                        {appointment.patientPhone}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-2" />
                      {appointment.date}
                      <span className="mx-2">•</span>
                      <Clock className="h-4 w-4 mr-1" />
                      {appointment.time}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Reason:</span> {appointment.reason}
                    </div>
                    {appointment.notes && (
                      <div className="text-sm mt-1">
                        <span className="font-medium">Notes:</span> {appointment.notes}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 mt-4 lg:mt-0 lg:ml-6">
                {appointment.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(appointment.id)}
                      disabled={actionLoading === appointment.id}
                      className="btn-primary flex items-center justify-center"
                    >
                      {actionLoading === appointment.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      ) : (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(appointment.id, appointment)}
                      disabled={actionLoading === appointment.id}
                      className="btn-outline border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Reject
                    </button>
                  </>
                )}
                
                {(appointment.status === 'approved' || appointment.status === 'confirmed') && (
                  <button
                    onClick={() => handleReject(appointment.id, appointment)}
                    disabled={actionLoading === appointment.id}
                    className="btn-outline border-red-200 text-red-600 hover:bg-red-50 flex items-center justify-center"
                  >
                    {actionLoading === appointment.id ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-2" />
                    )}
                    {appointment.paymentStatus === 'completed' ? 'Reject & Refund' : 'Reject'}
                  </button>
                )}
              </div>
            </div>
            
            {appointment.paymentStatus === 'completed' && appointment.status !== 'cancelled' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center text-green-800 text-sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  <span className="font-medium">Payment received:</span>
                  <span className="ml-2">${(appointment.amount! / 100).toFixed(2)}</span>
                  {appointment.paymentMethod && (
                    <span className="ml-2">via {appointment.paymentMethod}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentList;
