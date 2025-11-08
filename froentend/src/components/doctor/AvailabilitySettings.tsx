
import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WorkingDay {
  day: string;
  isWorking: boolean;
  timeSlots: string[];
}

interface AvailabilitySettingsProps {
  initialAvailability: {
    status: string;
    workingHours: WorkingDay[];
  };
  onAvailabilityChange?: (
    newAvailability: { status: string; workingHours: WorkingDay[] },
  ) => Promise<void> | void;
}

const AvailabilitySettings = ({
  initialAvailability,
  onAvailabilityChange,
}: AvailabilitySettingsProps) => {
  const { toast } = useToast();

  const normalizeAvailability = (
    availability: AvailabilitySettingsProps['initialAvailability'],
  ) => ({
    status: availability.status,
    workingHours: availability.workingHours.map(day => ({
      day: day.day,
      isWorking: day.isWorking,
      timeSlots: (day.timeSlots || [])
        .map(slot =>
          typeof slot === 'string'
            ? slot
            : typeof slot === 'object' && slot !== null
              ? (slot as { time?: string; isBooked?: boolean }).time ?? ''
              : String(slot),
        )
        .filter(Boolean),
    })),
  });

  const [availability, setAvailability] = useState(() => normalizeAvailability(initialAvailability));
  const [editingDay, setEditingDay] = useState<string | null>(null);
  const [editingSlots, setEditingSlots] = useState<string[]>([]);
  const [editingIsWorking, setEditingIsWorking] = useState<boolean>(true);
  const [timeInput, setTimeInput] = useState<string>('');
  const [savingDay, setSavingDay] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState<boolean>(false);

  const sortSlots = (slots: string[]) =>
    [...slots].sort((a, b) => parseTimeString(a) - parseTimeString(b));

  const parseTimeString = (value: string) => {
    const match = value.trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
    if (!match) return Number.MAX_SAFE_INTEGER;
    let hour = parseInt(match[1], 10);
    const minute = parseInt(match[2], 10);
    const period = match[3]?.toUpperCase();
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const formatTimeFromInput = (value: string) => {
    if (!value) return '';
    if (/(\d{1,2}):(\d{2})\s*(AM|PM)/i.test(value)) {
      return value.replace(/\s+/g, ' ').toUpperCase();
    }
    if (!value.includes(':')) return value;
    const [hourStr, minuteStr] = value.split(':');
    let hour = Number(hourStr);
    const minute = (minuteStr ?? '00').padStart(2, '0');
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${period}`;
  };

  useEffect(() => {
    setAvailability(normalizeAvailability(initialAvailability));
  }, [initialAvailability]);

  const handleEditAvailability = (day: WorkingDay) => {
    setEditingDay(day.day);
    setEditingSlots(sortSlots(day.timeSlots));
    setEditingIsWorking(day.isWorking);
    setTimeInput('');
  };

  const handleCancelEdit = () => {
    setEditingDay(null);
    setEditingSlots([]);
    setEditingIsWorking(true);
    setTimeInput('');
  };

  const handleAddTime = (event: FormEvent) => {
    event.preventDefault();
    if (!timeInput) return;
    const formatted = formatTimeFromInput(timeInput);
    if (!formatted) return;
    setEditingSlots(prev => {
      if (prev.includes(formatted)) return prev;
      return sortSlots([...prev, formatted]);
    });
    setTimeInput('');
  };

  const handleRemoveSlot = (slot: string) => {
    setEditingSlots(prev => prev.filter(item => item !== slot));
  };

  const handleSaveAvailability = async () => {
    if (!editingDay) return;
    const previousAvailability = availability;
    const updatedWorkingHours = availability.workingHours.map(item =>
      item.day === editingDay
        ? {
            ...item,
            isWorking: editingIsWorking,
            timeSlots: editingIsWorking ? sortSlots(editingSlots) : [],
          }
        : item,
    );
    const newAvailability = { ...availability, workingHours: updatedWorkingHours };

    if (!onAvailabilityChange) {
      setAvailability(newAvailability);
      setEditingDay(null);
      toast({
        title: 'Availability Updated',
        description: `Your availability for ${editingDay} has been updated.`,
      });
      return;
    }

    setSavingDay(editingDay);
    try {
      await onAvailabilityChange(newAvailability);
      setAvailability(newAvailability);
      setEditingDay(null);
      toast({
        title: 'Availability Updated',
        description: `Your availability for ${editingDay} has been updated.`,
      });
    } catch (error: any) {
      setAvailability(previousAvailability);
      toast({
        title: 'Update Failed',
        description: error?.message || 'We could not update your availability. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSavingDay(null);
    }
  };

  const handleStatusChange = async (event: ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value;
    const previousAvailability = availability;
    const newAvailability = { ...availability, status };

    if (!onAvailabilityChange) {
      setAvailability(newAvailability);
      return;
    }

    setStatusSaving(true);
    try {
      await onAvailabilityChange(newAvailability);
      setAvailability(newAvailability);
      toast({
        title: 'Availability Status Updated',
        description: `Your status is now set to ${status}.`,
      });
    } catch (error: any) {
      setAvailability(previousAvailability);
      toast({
        title: 'Update Failed',
        description: error?.message || 'We could not update your status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setStatusSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">Manage Availability</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <select
            value={availability.status}
            onChange={handleStatusChange}
            disabled={statusSaving}
            className="rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="available">Available</option>
            <option value="limited">Limited</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>
      <div className="glass-card rounded-xl p-6">
        <p className="text-muted-foreground mb-6">
          Set your working hours for each day of the week. Patients will only be able to book appointments during these times.
        </p>

        <div className="space-y-6">
          {availability.workingHours.map(day => (
            <div key={day.day} className="border-b border-border pb-4 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{day.day}</h3>
              </div>

              {editingDay === day.day ? (
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={editingIsWorking}
                      onChange={event => {
                        const isWorking = event.target.checked;
                        setEditingIsWorking(isWorking);
                        if (!isWorking) {
                          setEditingSlots([]);
                        }
                      }}
                    />
                    <span>Available this day</span>
                  </label>

                  {editingIsWorking ? (
                    <>
                      <form onSubmit={handleAddTime} className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="time"
                          value={timeInput}
                          onChange={event => setTimeInput(event.target.value)}
                          className="rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          aria-label="New time slot"
                        />
                        <button type="submit" className="btn-outline px-3 py-2 text-sm">
                          Add Time
                        </button>
                      </form>

                      {editingSlots.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {editingSlots.map(slot => (
                            <span
                              key={slot}
                              className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-sm"
                            >
                              {slot}
                              <button
                                type="button"
                                onClick={() => handleRemoveSlot(slot)}
                                className="ml-2 text-muted-foreground hover:text-destructive"
                                aria-label={`Remove ${slot}`}
                              >
                                ×
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No time slots added yet. Add one using the field above.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Patients will not be able to book appointments on {day.day}.
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleSaveAvailability}
                      disabled={savingDay === day.day}
                      className="btn-primary py-2 px-4 text-sm"
                    >
                      {savingDay === day.day ? 'Saving...' : 'Save'}
                    </button>
                    <button onClick={handleCancelEdit} className="btn-outline py-2 px-4 text-sm">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {day.isWorking && day.timeSlots.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {day.timeSlots.map(slot => (
                        <div key={slot} className="badge badge-outline">
                          {slot}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not available</p>
                  )}
                  <div className="mt-3">
                    <button
                      onClick={() => handleEditAvailability(day)}
                      className="btn-outline py-1 px-3 text-xs"
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AvailabilitySettings;
