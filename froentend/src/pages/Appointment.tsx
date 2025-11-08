import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { AppointmentStatusType } from '@/components/ui/AppointmentStatus';
import { fetchDoctors, fetchDoctorById } from '@/services/api';
import { appointmentService } from '@/services/appointmentApi';

// Import components
import AppointmentSteps from '@/components/appointment/AppointmentSteps';
import DoctorSelection from '@/components/appointment/DoctorSelection';
import AppointmentTimeSelection from '@/components/appointment/AppointmentTimeSelection';
import PatientInfoForm, { PatientFormData } from '@/components/appointment/PatientInfoForm';
import PaymentOptions from '@/components/payment/PaymentOptions';
import AppointmentConfirmation from '@/components/appointment/AppointmentConfirmation';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Appointment = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();
  const doctorId = query.get('doctorId') || '';
  const doctorName = query.get('doctorName') || '';
  const doctorSpecialty = query.get('doctorSpecialty') || '';
  const doctorImage = query.get('doctorImage') || '';

  const [step, setStep] = useState(doctorId ? 2 : 1);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(doctorId ? {
    id: doctorId,
    name: doctorName,
    specialty: doctorSpecialty,
    image: doctorImage,
    location: 'Main Medical Center',
    consultationFee: 4999, // ₹49.99
  } : null);
  const [selectedDateTime, setSelectedDateTime] = useState<{ date: Date; time: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [appointmentStatus, setAppointmentStatus] = useState<AppointmentStatusType>('pending');
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);

  // Initialize form data state with user data if available
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    reason: '',
    notes: ''
  });

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        const doctors = await fetchDoctors();
        setFilteredDoctors(doctors);
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to load doctors.', variant: 'destructive' });
      }
    };

    loadDoctors();
  }, []);

  useEffect(() => {
    const loadDoctorById = async () => {
      if (doctorId && !doctorName) {
        try {
          const doctor = await fetchDoctorById(doctorId);
          setSelectedDoctor({
            id: doctor.id,
            name: doctor.name,
            specialty: doctor.specialty,
            image: doctor.image,
            location: doctor.location || 'Main Medical Center',
            consultationFee: doctor.consultationFee || 4999,
          });
        } catch (error) {
          toast({ title: 'Error', description: 'Doctor not found.', variant: 'destructive' });
        }
      }
    };

    loadDoctorById();
  }, [doctorId]);

  useEffect(() => {
    const filterDoctors = async () => {
      if (searchTerm) {
        try {
          const doctors = await fetchDoctors();
          const filtered = doctors.filter((doctor: any) =>
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
          );
          setFilteredDoctors(filtered);
        } catch (error) {
          console.error('Error filtering doctors:', error);
        }
      }
    };

    filterDoctors();
  }, [searchTerm]);

  const handleSelectDoctor = (doctor: any) => {
    setSelectedDoctor(doctor);
    setStep(2);
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setSelectedDateTime({ date, time });
  };

  const handleProceedFromTimeSelection = () => {
    if (!selectedDateTime) {
      toast({
        title: 'Select a time',
        description: 'Please choose a date and time before continuing.',
        variant: 'destructive',
      });
      return;
    }
    setStep(3);
  };

  const handlePatientInfoSubmit = async (values: PatientFormData) => {
    if (!selectedDoctor || !selectedDateTime) {
      toast({
        title: 'Unable to create appointment',
        description: 'Please select a doctor and time slot before submitting your details.',
        variant: 'destructive',
      });
      return;
    }

    setFormData(values);

    try {
      toast({
        title: 'Creating Appointment',
        description: 'Setting up your appointment...',
        variant: 'default',
      });

      const appointmentData = {
        doctorId: selectedDoctor.id,
        date: selectedDateTime.date.toISOString().split('T')[0],
        time: selectedDateTime.time,
        patientName: `${values.firstName} ${values.lastName}`.trim(),
        patientEmail: values.email,
        patientPhone: values.phone,
        reason: values.reason,
        notes: values.notes,
      };

      const response = await appointmentService.createAppointment(appointmentData);
      console.log('Created appointment response:', response);

      if (response && response.data && response.data.id) {
        setCreatedAppointmentId(response.data.id);
        setAppointmentStatus('booked');
        setStep(4); // Go to payment step
      } else {
        console.error('Invalid appointment creation response:', response);
        throw new Error('Failed to create appointment');
      }

      toast({
        title: 'Appointment Created!',
        description: 'Please proceed with payment to confirm your appointment.',
        variant: 'default',
      });
    } catch (error: any) {
      console.error('Error creating appointment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create appointment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handlePaymentSuccess = (_appointmentId: string, method: string) => {
    setAppointmentStatus('confirmed');
    setStep(5); // Go to confirmation step
    
    toast({
      title: method === 'offline' ? "Appointment Confirmed!" : "Payment Successful!",
      description: method === 'offline'
        ? "Your appointment has been booked. Please complete payment at the hospital."
        : "Your appointment has been confirmed.",
      variant: "default"
    });
  };

  const handlePaymentCancel = () => {
    toast({
      title: "Payment Cancelled",
      description: "You can complete payment later from your dashboard.",
      variant: "default"
    });
    navigate('/patient-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow py-24">
        <div className="container">
          {step < 5 && <AppointmentSteps currentStep={step} />}

          {step === 1 && (
            <DoctorSelection
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filteredDoctors={filteredDoctors}
              onSelectDoctor={handleSelectDoctor}
            />
          )}

          {step === 2 && selectedDoctor && (
            <AppointmentTimeSelection
              selectedDoctor={selectedDoctor}
              onSelectDateTime={handleDateTimeSelect}
              selectedDateTime={selectedDateTime}
              onContinue={handleProceedFromTimeSelection}
            />
          )}

          {step === 3 && (
            <PatientInfoForm
              defaultValues={formData}
              onSubmit={handlePatientInfoSubmit}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && createdAppointmentId && selectedDoctor && (
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Complete Payment</h2>
                <p className="text-gray-600">
                  Your appointment has been created. Please complete payment to confirm.
                </p>
              </div>
              <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                <PaymentOptions
                  appointmentId={createdAppointmentId}
                  amount={selectedDoctor.consultationFee}
                  onSuccess={handlePaymentSuccess}
                />
                <div className="pt-4 border-t border-border text-center">
                  <button
                    onClick={handlePaymentCancel}
                    className="w-full py-2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel & Pay Later
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <AppointmentConfirmation
              appointmentStatus={appointmentStatus}
              selectedDoctor={selectedDoctor}
              selectedDateTime={selectedDateTime}
              formData={formData}
              appointmentId={createdAppointmentId}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Appointment;
