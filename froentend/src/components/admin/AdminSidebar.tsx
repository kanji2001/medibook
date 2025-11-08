import { FC } from 'react';
import { Calendar, FileText, Settings, Users } from 'lucide-react';
import { AdminSection } from './types';

interface AdminSidebarProps {
  userName?: string | null;
  userAvatar?: string | null;
  onLogout: () => void;
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

const defaultAvatar =
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

const AdminSidebar: FC<AdminSidebarProps> = ({
  userName,
  userAvatar,
  onLogout,
  activeSection,
  onSectionChange,
}) => {
  const navItems: Array<{
    key: AdminSection;
    label: string;
    icon: FC<{ className?: string }>;
  }> = [
    { key: 'users', label: 'Users', icon: Users },
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'reports', label: 'Reports', icon: FileText },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="glass-card rounded-xl p-5 text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
            <img
              src={userAvatar || defaultAvatar}
              alt={userName || 'Admin'}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-semibold text-lg">{userName || 'Admin User'}</h3>
          <div className="badge badge-outline mt-1 mb-4">Admin</div>
          <button onClick={onLogout} className="btn-outline w-full text-sm py-1.5">
            Sign Out
          </button>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <nav className="text-sm">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSectionChange(item.key)}
                  className={`w-full text-left flex items-center py-3 px-4 transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;

