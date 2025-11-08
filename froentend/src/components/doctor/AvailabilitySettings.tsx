
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TimeSlot {
  day: string;
  isWorking: boolean;
  timeSlots: string[];
}

interface AvailabilitySettingsProps {
  initialAvailability: {
    status: string;
    workingHours: TimeSlot[];
  };
  onAvailabilityChange?: (newAvailability: { status: string; workingHours: TimeSlot[] }) => void;
}

const AvailabilitySettings = ({ 
  initialAvailability,
  onAvailabilityChange 
}: AvailabilitySettingsProps) => {
  const [availability, setAvailability] = useState(initialAvailability);
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditAvailability = (day: string) => {
    setEditingDay(day);
  };

  const handleSaveAvailability = (day: string, slots: string[]) => {
    const newWorkingHours = availability.workingHours.map(item => 
      item.day === day ? { ...item, timeSlots: slots } : item
    );
    
    const newAvailability = {
      ...availability,
      workingHours: newWorkingHours
    };
    
    setAvailability(newAvailability);
    setEditingDay(null);
    
    if (onAvailabilityChange) {
      onAvailabilityChange(newAvailability);
    }
    
    toast({
      title: "Availability Updated",
      description: `Your availability for ${day} has been updated.`,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manage Availability</h2>
      <div className="glass-card rounded-xl p-6">
        <p className="text-muted-foreground mb-6">
          Set your working hours for each day of the week. Patients will only be able to book appointments during these times.
        </p>
        
        <div className="space-y-6">
          {availability.workingHours.map((day) => (
            <div key={day.day} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{day.day}</h3>
                
                {editingDay !== day.day ? (
                  <button 
                    onClick={() => handleEditAvailability(day.day)}
                    className="btn-outline py-1 px-3 text-xs"
                  >
                    Edit
                  </button>
                ) : (
                  <button 
                    onClick={() => handleSaveAvailability(day.day, day.timeSlots)}
                    className="btn-primary py-1 px-3 text-xs"
                  >
                    Save
                  </button>
                )}
              </div>
              
              {day.timeSlots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {day.timeSlots.map((slot, index) => (
                    <div key={index} className="badge badge-outline">
                      {slot}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not available
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySettings;
