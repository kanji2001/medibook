import type { AppointmentResponse } from '@/services/appointmentApi';

interface DoctorPatientsPanelProps {
  patients: AppointmentResponse[];
}

const DoctorPatientsPanel = ({ patients }: DoctorPatientsPanelProps) => {
  if (!patients.length) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-2">No patients yet</h2>
        <p className="text-muted-foreground text-sm">
          Once appointments are booked, you’ll see a list of unique patients here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Patients</h2>
        <span className="text-sm text-muted-foreground">{patients.length} total</span>
      </div>
      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-secondary/40">
            <tr className="text-left text-sm text-muted-foreground">
              <th className="py-3 px-4 font-medium">Patient</th>
              <th className="py-3 px-4 font-medium">Email</th>
              <th className="py-3 px-4 font-medium">Phone</th>
              <th className="py-3 px-4 font-medium">Last Visit</th>
            </tr>
          </thead>
          <tbody>
            {patients.map(patient => (
              <tr key={patient.patientEmail} className="border-t border-border">
                <td className="py-3 px-4 font-medium">{patient.patientName}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{patient.patientEmail}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">{patient.patientPhone || '—'}</td>
                <td className="py-3 px-4 text-sm text-muted-foreground">
                  {patient.date
                    ? new Date(patient.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DoctorPatientsPanel;

