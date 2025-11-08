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
import RazorpayCheckout from '@/components/payment/RazorpayCheckout';
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 2 && selectedDateTime) {
      setStep(3);
    } else if (step === 3) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      try {
        toast({
          title: "Creating Appointment",
          description: "Setting up your appointment...",
          variant: "default"
        });

        const appointmentData = {
          doctorId: selectedDoctor.id,
          date: selectedDateTime!.date.toISOString().split('T')[0],
          time: selectedDateTime!.time,
          patientName: `${formData.firstName} ${formData.lastName}`,
          patientEmail: formData.email,
          patientPhone: formData.phone,
          reason: formData.reason,
          notes: formData.notes,
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
          title: "Appointment Created!",
          description: "Please proceed with payment to confirm your appointment.",
          variant: "default"
        });
      } catch (error: any) {
        console.error('Error creating appointment:', error);
        toast({
          title: "Error",
          description: error.message || 'Failed to create appointment. Please try again.',
          variant: "destructive"
        });
      }
    }
  };

  const handlePaymentSuccess = () => {
    setAppointmentStatus('confirmed');
    setStep(5); // Go to confirmation step
    
    toast({
      title: "Payment Successful!",
      description: "Your appointment has been confirmed.",
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
              onContinue={() => handleSubmit({ preventDefault: () => {} } as React.FormEvent)}
            />
          )}

          {step === 3 && (
            <PatientInfoForm
              formData={formData}
              onInputChange={handleInputChange}
              onSubmit={handleSubmit}
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
              <RazorpayCheckout
                appointmentId={createdAppointmentId}
                amount={selectedDoctor.consultationFee}
                onSuccess={handlePaymentSuccess}
                onCancel={handlePaymentCancel}
              />
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
