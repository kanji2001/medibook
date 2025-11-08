
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, User, CreditCard as PaymentIcon, Wallet } from 'lucide-react';
import { AppointmentStatusType } from '@/components/ui/AppointmentStatus';
import AppointmentStatus from '@/components/ui/AppointmentStatus';
import { PatientFormData } from './PatientInfoForm';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  consultationFee: number;
}

interface AppointmentStatusViewProps {
  appointmentStatus: AppointmentStatusType;
  selectedDoctor: Doctor;
  selectedDateTime: { date: Date; time: string } | null;
  formData: PatientFormData;
  paymentMethod: 'online' | 'offline' | null;
  onPaymentSelect: (method: 'online' | 'offline') => void;
}

const AppointmentStatusView = ({ 
  appointmentStatus, 
  selectedDoctor, 
  selectedDateTime, 
  formData, 
  paymentMethod,
  onPaymentSelect
}: AppointmentStatusViewProps) => {
  
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="glass-card rounded-xl p-8">
        {appointmentStatus === 'pending' && (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-10 h-10 text-amber-500" />
            </div>
            
            <h1 className="heading-lg mb-4">Appointment Requested</h1>
            <p className="text-muted-foreground mb-8">
              Your appointment request has been sent to {selectedDoctor.name} for approval.
              We'll notify you once the doctor approves your request.
            </p>
            
            <AppointmentStatus status="pending" className="mx-auto mb-8" />
          </>
        )}
        
        {appointmentStatus === 'approved' && (
          <>
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-blue-500" />
            </div>
            
            <h1 className="heading-lg mb-4">Appointment Approved!</h1>
            <p className="text-muted-foreground mb-4">
              Great news! {selectedDoctor.name} has approved your appointment request.
              Please select your preferred payment method to confirm the appointment.
            </p>
            
            <AppointmentStatus status="approved" className="mx-auto mb-8" />
            
            <div className="bg-secondary/50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => onPaymentSelect('online')}
                  className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <PaymentIcon className="w-8 h-8 text-primary mb-2" />
                  <span className="font-medium">Pay Online</span>
                  <span className="text-xs text-muted-foreground mt-1">Credit/Debit Card, PayPal</span>
                </button>
                
                <button
                  onClick={() => onPaymentSelect('offline')}
                  className="flex flex-col items-center p-4 border border-border rounded-lg hover:bg-primary/5 transition-colors"
                >
                  <Wallet className="w-8 h-8 text-primary mb-2" />
                  <span className="font-medium">Pay at Clinic</span>
                  <span className="text-xs text-muted-foreground mt-1">Cash, Check, Insurance</span>
                </button>
              </div>
            </div>
          </>
        )}
        
        {(appointmentStatus === 'paid' || appointmentStatus === 'unpaid') && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PaymentIcon className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="heading-lg mb-4">
              {appointmentStatus === 'paid' ? 'Payment Successful!' : 'Payment Method Selected'}
            </h1>
            <p className="text-muted-foreground mb-4">
              {appointmentStatus === 'paid' 
                ? `Your payment of $${selectedDoctor.consultationFee} has been processed successfully.`
                : 'You have chosen to pay at the clinic during your appointment.'}
            </p>
            
            <AppointmentStatus status={appointmentStatus} className="mx-auto mb-8" />
            
            <div className="animate-pulse text-sm text-muted-foreground mb-6">
              Confirming your appointment...
            </div>
          </>
        )}
        
        {appointmentStatus === 'confirmed' && (
          <>
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            
            <h1 className="heading-lg mb-4">Appointment Confirmed!</h1>
            <p className="text-muted-foreground mb-8">
              Your appointment with {selectedDoctor.name} has been successfully confirmed.
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
                  <div className="font-medium">
                    {selectedDoctor.location}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Payment</div>
                  <div className="font-medium">
                    {paymentMethod === 'online' ? 'Paid Online' : 'Pay at Clinic'}
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              We've sent a confirmation email to <strong>{formData.email}</strong> with all the appointment details.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/" className="btn-outline">
                Return to Home
              </Link>
              <Link to="/patient-dashboard" className="btn-primary flex items-center justify-center">
                View My Appointments
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AppointmentStatusView;
