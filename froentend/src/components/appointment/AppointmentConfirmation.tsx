
import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, User, MapPin } from 'lucide-react';
import { AppointmentStatusType } from '@/components/ui/AppointmentStatus';
import AppointmentStatus from '@/components/ui/AppointmentStatus';
import { PatientFormData } from './PatientInfoForm';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  consultationFee: number;
}

interface AppointmentConfirmationProps {
  appointmentStatus: AppointmentStatusType;
  selectedDoctor: Doctor;
  selectedDateTime: { date: Date; time: string } | null;
  formData: PatientFormData;
  appointmentId: string | null;
}

const AppointmentConfirmation = ({ 
  appointmentStatus, 
  selectedDoctor, 
  selectedDateTime, 
  formData,
  appointmentId
}: AppointmentConfirmationProps) => {
  const { toast } = useToast();
  const backendBaseUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL;
    return base ? base.replace(/\/+$/, '') : '';
  }, []);
  const [downloadingReceipt, setDownloadingReceipt] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState(false);

  const fetchReceiptBlob = useCallback(
    async (options: { inline: boolean }) => {
      if (!appointmentId) {
        throw new Error('Appointment ID missing.');
      }

      if (!backendBaseUrl) {
        throw new Error('Backend URL is not configured.');
      }

      const url = `${backendBaseUrl}/api/appointments/${appointmentId}/receipt${options.inline ? '?inline=true' : ''}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken') || ''}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        throw new Error(errorText || 'Failed to fetch receipt.');
      }

      return response.blob();
    },
    [appointmentId, backendBaseUrl],
  );

  const handleDownloadReceipt = useCallback(async () => {
    try {
      setDownloadingReceipt(true);
      const blob = await fetchReceiptBlob({ inline: false });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `appointment_${appointmentId}_receipt.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Receipt downloaded',
        description: 'Your payment receipt has been saved.',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to download receipt.';
      toast({
        title: 'Download failed',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDownloadingReceipt(false);
    }
  }, [appointmentId, fetchReceiptBlob, toast]);

  const handleViewReceipt = useCallback(async () => {
    try {
      setViewingReceipt(true);
      const blob = await fetchReceiptBlob({ inline: true });
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60_000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to open receipt.';
      toast({
        title: 'Unable to open receipt',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setViewingReceipt(false);
    }
  }, [fetchReceiptBlob, toast]);
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="glass-card rounded-xl p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        
        <h1 className="heading-lg mb-4">Appointment Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Your appointment with {selectedDoctor.name} has been successfully confirmed and paid.
        </p>
        
        <AppointmentStatus status="confirmed" className="mx-auto mb-8" />
        
        <div className="bg-secondary/50 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-6">
            <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden mr-4">
              <img 
                src={selectedDoctor.image} 
                alt={selectedDoctor.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-left">
              <h3 className="font-semibold">{selectedDoctor.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-left">
            <div>
              <div className="text-sm text-muted-foreground">Date & Time</div>
              <div className="font-medium flex items-center">
                <Calendar className="w-4 h-4 mr-2 text-primary" />
                {selectedDateTime ? (
                  <>
                    {new Date(selectedDateTime.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    {' at '}
                    {selectedDateTime.time}
                  </>
                ) : 'Not selected'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Patient</div>
              <div className="font-medium flex items-center">
                <User className="w-4 h-4 mr-2 text-primary" />
                {formData.firstName} {formData.lastName}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div className="font-medium flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-primary" />
                {selectedDoctor.location}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Payment Status</div>
              <div className="font-medium text-green-600">
                Paid (${(selectedDoctor.consultationFee / 100).toFixed(2)})
              </div>
            </div>
          </div>
          
          {appointmentId && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="text-sm text-muted-foreground">Appointment ID</div>
              <div className="font-mono text-sm">{appointmentId}</div>
            </div>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground mb-6">
          We've sent a confirmation email to <strong>{formData.email}</strong> with all the appointment details.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Important:</strong> Your doctor will review your appointment and may contact you if any changes are needed. 
            In the rare case of cancellation by the doctor, you will receive a full refund within 24-48 hours.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Link to="/" className="btn-outline w-full text-center">
            Return to Home
          </Link>
          {appointmentId && (
            <button
              type="button"
              onClick={handleDownloadReceipt}
              className="btn-outline w-full"
              disabled={downloadingReceipt}
            >
              {downloadingReceipt ? 'Preparing...' : 'Download Receipt'}
            </button>
          )}
          {appointmentId && (
            <button
              type="button"
              onClick={handleViewReceipt}
              className="btn-outline w-full"
              disabled={viewingReceipt}
            >
              {viewingReceipt ? 'Opening...' : 'View Payment Slip'}
            </button>
          )}
          <Link to="/patient-dashboard" className="btn-primary flex items-center justify-center w-full">
            View My Appointments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppointmentConfirmation;
