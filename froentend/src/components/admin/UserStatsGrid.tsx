import { FC } from 'react';
import { Calendar, Clock, User, Users } from 'lucide-react';
import { UserFilter } from './types';

interface UserStatsGridProps {
  totalUsers: number;
  totalPatients: number;
  totalDoctors: number;
  pendingDoctors: number;
  totalAppointments: number;
  activeFilter: UserFilter;
  onFilterSelect: (filter: UserFilter) => void;
  onViewAppointments: () => void;
}

const UserStatsGrid: FC<UserStatsGridProps> = ({
  totalUsers,
  totalPatients,
  totalDoctors,
  pendingDoctors,
  totalAppointments,
  activeFilter,
  onFilterSelect,
  onViewAppointments,
}) => {
  const cards: Array<{
    key: UserFilter;
    label: string;
    value: number;
    icon: JSX.Element;
    accent: string;
  }> = [
    {
      key: 'all',
      label: 'Total Users',
      value: totalUsers,
      icon: <Users className="w-5 h-5 text-primary" />,
      accent: 'bg-primary/10',
    },
    {
      key: 'patients',
      label: 'Patients',
      value: totalPatients,
      icon: <User className="w-5 h-5 text-blue-600" />,
      accent: 'bg-blue-100',
    },
    {
      key: 'doctors',
      label: 'Doctors',
      value: totalDoctors,
      icon: <User className="w-5 h-5 text-green-600" />,
      accent: 'bg-green-100',
    },
    {
      key: 'pending',
      label: 'Pending Approvals',
      value: pendingDoctors,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      accent: 'bg-yellow-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {cards.map(card => (
        <button
          type="button"
          key={card.key}
          onClick={() => onFilterSelect(card.key)}
          className={`glass-card rounded-xl p-4 text-left transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/40 ${
            activeFilter === card.key ? 'ring-2 ring-primary/60' : ''
          }`}
        >
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${card.accent}`}>
              {card.icon}
            </div>
            <div>
              <div className="text-muted-foreground text-sm">{card.label}</div>
              <div className="text-2xl font-semibold">{card.value}</div>
            </div>
          </div>
        </button>
      ))}

      <button
        type="button"
        onClick={onViewAppointments}
        className="glass-card rounded-xl p-4 text-left transition transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-muted-foreground text-sm">Total Appointments</div>
            <div className="text-2xl font-semibold">{totalAppointments}</div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default UserStatsGrid;

