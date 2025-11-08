import { FC } from 'react';
import { Calendar } from 'lucide-react';
import { AdminAppointment } from '@/stores/adminStore';

interface AppointmentsPanelProps {
  appointments: AdminAppointment[];
  loading: boolean;
}

const AppointmentsPanel: FC<AppointmentsPanelProps> = ({ appointments, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="mt-4 text-muted-foreground">Loading appointments...</p>
      </div>
    );
  }

  if (!appointments.length) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
        <p className="text-muted-foreground">There are no appointments in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-2 px-4 font-medium">ID</th>
            <th className="text-left py-2 px-4 font-medium">Patient</th>
            <th className="text-left py-2 px-4 font-medium">Doctor</th>
            <th className="text-left py-2 px-4 font-medium">Date &amp; Time</th>
            <th className="text-left py-2 px-4 font-medium">Status</th>
            <th className="text-right py-2 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map(appointment => {
            const appointmentDate = appointment.date ? new Date(appointment.date) : null;
            const dateLabel = appointmentDate
              ? appointmentDate.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })
              : '—';

            const timeLabel =
              appointment.time ||
              (appointmentDate
                ? appointmentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                : '—');

            const statusClass =
              appointment.status === 'confirmed'
                ? 'bg-green-100 text-green-800'
                : appointment.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800';

            const statusLabel = appointment.status
              ? appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)
              : 'Unknown';

            return (
              <tr key={appointment.id} className="border-b border-border last:border-none">
                <td className="py-4 px-4">{appointment.id}</td>
                <td className="py-4 px-4">{appointment.patientName || '—'}</td>
                <td className="py-4 px-4">
                  <div>{appointment.doctorName || '—'}</div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.doctorSpecialty || '—'}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>{dateLabel}</div>
                  <div className="text-sm text-muted-foreground">{timeLabel}</div>
                </td>
                <td className="py-4 px-4">
                  <div className={`badge ${statusClass}`}>{statusLabel}</div>
                </td>
                <td className="py-4 px-4 text-right">
                  <button className="btn-outline py-1 px-3 text-xs">View Details</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentsPanel;

