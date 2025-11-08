
import { useState } from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format, addDays, startOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { createAppointment } from '@/utils/appointmentUtils';
import { useAuth } from '@/context/AuthContext';

interface AppointmentCalendarProps {
  onSelectDateTime: (date: Date, time: string) => void;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorImage: string;
}

const timeSlots = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '1:00 PM', '1:30 PM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '4:00 PM', '4:30 PM', '5:00 PM'
];

// Function to get available slots
const getAvailableSlots = (date: Date): string[] => {
  // Just a simple logic that makes weekends have fewer slots
  const day = date.getDay();
  if (day === 0) return ['11:00 AM', '11:30 AM']; // Sunday - limited slots
  if (day === 6) return timeSlots.filter((_, i) => i % 3 === 0); // Saturday - fewer slots
  
  // Weekdays - most slots available but with some randomness
  return timeSlots.filter(() => Math.random() > 0.3);
};

const AppointmentCalendar = ({ 
  onSelectDateTime, 
  doctorId, 
  doctorName, 
  doctorSpecialty, 
  doctorImage 
}: AppointmentCalendarProps) => {
  const [date, setDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      setSelectedTime(undefined); // Reset time when date changes
      setAvailableSlots(getAvailableSlots(selectedDate));
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (date) {
      onSelectDateTime(date, time);
      
      // If user is logged in, create an appointment in localStorage
      if (user) {
        createAppointment({
          doctorId,
          userId: user.id,
          patientName: user.name,
          doctorName,
          doctorSpecialty,
          doctorImage,
          date: format(date, 'yyyy-MM-dd'),
          time,
          status: 'pending',
          notes: 'New appointment booking'
        });
        
        toast({
          title: "Appointment Booked",
          description: `Your appointment with Dr. ${doctorName} has been scheduled for ${format(date, 'PP')} at ${time}.`,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Date</h3>
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex h-12 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2",
                !date && "text-muted-foreground"
              )}
            >
              <div className="flex items-center">
                <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                {date ? format(date, "PPP") : <span>Select a date</span>}
              </div>
              <div className={date ? "badge badge-outline" : "hidden"}>
                {date && format(date, "EEE")}
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => {
                // Disable past dates, only allow booking 30 days in advance
                const today = startOfDay(new Date());
                const maxDate = addDays(today, 30);
                return date < today || date > maxDate;
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className={date ? "animate-fade-in" : "hidden"}>
        <h3 className="text-lg font-semibold mb-2">Select Time</h3>
        <div className="grid grid-cols-3 gap-2">
          {availableSlots.length > 0 ? (
            availableSlots.map((time) => (
              <button
                key={time}
                className={cn(
                  "flex items-center justify-center rounded-md border p-3 text-sm transition-colors",
                  selectedTime === time
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input hover:bg-secondary"
                )}
                onClick={() => handleTimeSelect(time)}
              >
                <Clock className="mr-2 h-3.5 w-3.5 text-current" />
                {time}
              </button>
            ))
          ) : (
            <div className="col-span-3 text-center py-4 text-muted-foreground">
              {date ? "No available time slots for selected date" : "Select a date to see available times"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
