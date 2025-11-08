
import React, { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, User, Phone, Mail, CheckCircle, X, AlertTriangle } from 'lucide-react';
import AppointmentStatus from '@/components/ui/AppointmentStatus';
import useAppointmentStore from '@/stores/appointmentStore';
import type { AppointmentResponse } from '@/services/appointmentApi';
import ConfirmDialog from '@/components/ui/confirm-dialog';

const AppointmentList: React.FC = () => {
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [pendingReject, setPendingReject] = useState<{
    appointmentId: string;
    appointment: AppointmentResponse;
  } | null>(null);
  const {
    doctorAppointments,
    loadingDoctorAppointments,
    fetchDoctorAppointments,
    updateAppointmentStatus,
  } = useAppointmentStore(state => ({
    doctorAppointments: state.doctorAppointments,
    loadingDoctorAppointments: state.loadingDoctorAppointments,
    fetchDoctorAppointments: state.fetchDoctorAppointments,
    updateAppointmentStatus: state.updateAppointmentStatus,
  }));

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchDoctorAppointments().catch(error => {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to load appointments. Please try again.',
        variant: 'destructive',
      });
    });
  }, [fetchDoctorAppointments, toast]);

  const handleApprove = async (appointmentId: string) => {
    try {
      setActionLoading(appointmentId);
      const updated = await updateAppointmentStatus(appointmentId, 'approved');

      toast({
        title: 'Appointment Approved',
        description: `The appointment with ${updated.patientName} has been approved.`,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to approve appointment.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (appointmentId: string, appointment: AppointmentResponse) => {
    try {
      setActionLoading(appointmentId);
      const updated = await updateAppointmentStatus(appointmentId, 'cancelled');

      const refundMessage =
        appointment.paymentStatus === 'completed'
          ? 'The appointment has been rejected and a refund will be processed within 24-48 hours.'
          : 'The appointment has been rejected.';

      toast({
        title: 'Appointment Rejected',
        description: refundMessage,
        variant: 'destructive',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to reject appointment.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    try {
      await handleReject(pendingReject.appointmentId, pendingReject.appointment);
    } finally {
      setPendingReject(null);
    }
  };

  if (loadingDoctorAppointments) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading appointments...</p>
        </div>
      </div>
    );
  }

  if (!doctorAppointments.length) {
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
          onClick={() =>
            fetchDoctorAppointments().catch(error =>
              toast({
                title: 'Error',
                description: error?.message || 'Failed to refresh appointments.',
                variant: 'destructive',
              }),
            )
          }
          className="text-sm text-primary hover:underline"
        >
          Refresh
        </button>
      </div>
      
      <div className="space-y-4">
        {doctorAppointments.map(appointment => (
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
                      onClick={() =>
                        setPendingReject({ appointmentId: appointment.id, appointment })
                      }
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
                    onClick={() =>
                      setPendingReject({ appointmentId: appointment.id, appointment })
                    }
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
      <ConfirmDialog
        open={Boolean(pendingReject)}
        onOpenChange={open => {
          if (!open) setPendingReject(null);
        }}
        title="Reject this appointment?"
        description="This action cannot be undone. The patient will be notified and, if payment was completed, a refund will be initiated."
        confirmLabel="Confirm Reject"
        confirmLoadingLabel="Rejecting..."
        confirmTone="destructive"
        confirmLoading={actionLoading !== null}
        confirmDisabled={actionLoading !== null}
        onConfirm={confirmReject}
        onCancel={() => setPendingReject(null)}
      />
    </div>
  );
};

export default AppointmentList;
