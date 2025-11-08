
import { Calendar, ChevronRight } from 'lucide-react';
import AppointmentCalendar from '@/components/ui/AppointmentCalendar';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  location: string;
  consultationFee: number;
}

interface AppointmentTimeSelectionProps {
  selectedDoctor: Doctor;
  onSelectDateTime: (date: Date, time: string) => void;
  selectedDateTime: { date: Date; time: string } | null;
  onContinue: () => void;
}

const AppointmentTimeSelection = ({ 
  selectedDoctor, 
  onSelectDateTime, 
  selectedDateTime, 
  onContinue 
}: AppointmentTimeSelectionProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="heading-lg text-center mb-8">Select Appointment Time</h1>
      
      <div className="glass-card rounded-xl p-6 mb-6">
        <div className="flex items-center mb-6">
          <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden mr-4">
            <img 
              src={selectedDoctor.image} 
              alt={selectedDoctor.name} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold">{selectedDoctor.name}</h3>
            <p className="text-sm text-muted-foreground">{selectedDoctor.specialty}</p>
            <div className="text-sm text-muted-foreground mt-1">{selectedDoctor.location}</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-lg font-semibold text-primary">${selectedDoctor.consultationFee}</div>
            <div className="text-sm text-muted-foreground">Consultation Fee</div>
          </div>
        </div>
        
        <AppointmentCalendar 
          onSelectDateTime={onSelectDateTime} 
        />
      </div>
      
      <div className="flex justify-end">
        <button 
          className={`btn-primary ${!selectedDateTime ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!selectedDateTime}
          onClick={onContinue}
        >
          Continue to Patient Information
          <ChevronRight className="ml-2 w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default AppointmentTimeSelection;
