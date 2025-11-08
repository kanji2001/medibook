
import { useState } from 'react';
import { Calendar, Clock, Users, MessageSquare, Settings, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import ConfirmDialog from '@/components/ui/confirm-dialog';

interface DoctorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  specialty?: string;
}

const DoctorSidebar = ({ activeTab, setActiveTab, specialty }: DoctorSidebarProps) => {
  const { user, logout } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const navItems: Array<{
    key: string;
    label: string;
    icon: typeof Calendar;
  }> = [
    { key: 'appointments', label: 'Appointments', icon: Calendar },
    { key: 'availability', label: 'Availability', icon: Clock },
    { key: 'patients', label: 'Patients', icon: Users },
    { key: 'messages', label: 'Messages', icon: MessageSquare },
    { key: 'earnings', label: 'Earnings', icon: Wallet },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="lg:w-64 shrink-0">
      <div className="sticky top-24 space-y-6">
        {/* Profile Summary */}
        <div className="glass-card rounded-xl p-5 text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden mx-auto mb-4">
            <img 
              src={user?.avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"}
              alt={user?.name || "Doctor"} 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-semibold text-lg">{user?.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {specialty || user?.specialty || 'Doctor'}
          </p>
          <button className="btn-outline w-full text-sm py-1.5" onClick={() => setConfirmSignOut(true)}>
            Sign Out
          </button>
        </div>
        <ConfirmDialog
          open={confirmSignOut}
          onOpenChange={setConfirmSignOut}
          title="Sign out?"
          description="You'll be logged out of your doctor dashboard. You can log in again at any time."
          confirmLabel="Sign Out"
          confirmTone="destructive"
          onConfirm={() => {
            setConfirmSignOut(false);
            logout();
          }}
        />
        
        {/* Navigation */}
        <div className="glass-card rounded-xl overflow-hidden">
          <nav className="text-sm">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key)}
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
    </div>
  );
};

export default DoctorSidebar;
