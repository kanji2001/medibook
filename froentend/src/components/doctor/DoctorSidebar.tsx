
import { Link } from 'react-router-dom';
import { Calendar, Clock, User, FileText, MessageSquare, Settings, Wallet } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface DoctorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DoctorSidebar = ({ activeTab, setActiveTab }: DoctorSidebarProps) => {
  const { user, logout } = useAuth();

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
          <p className="text-sm text-muted-foreground mb-4">Cardiologist</p>
          <button 
            onClick={logout}
            className="btn-outline w-full text-sm py-1.5"
          >
            Sign Out
          </button>
        </div>
        
        {/* Navigation */}
        <div className="glass-card rounded-xl overflow-hidden">
          <nav className="text-sm">
            <button 
              onClick={() => setActiveTab('appointments')}
              className={`w-full text-left flex items-center py-3 px-4 ${
                activeTab === 'appointments' 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : 'hover:bg-secondary transition-colors'
              }`}
            >
              <Calendar className="w-4 h-4 mr-3" />
              Appointments
            </button>
            <button 
              onClick={() => setActiveTab('availability')}
              className={`w-full text-left flex items-center py-3 px-4 ${
                activeTab === 'availability' 
                  ? 'bg-primary/10 text-primary border-l-2 border-primary' 
                  : 'hover:bg-secondary transition-colors'
              }`}
            >
              <Clock className="w-4 h-4 mr-3" />
              Availability
            </button>
            <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
              <FileText className="w-4 h-4 mr-3" />
              Patients
            </Link>
            <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
              <MessageSquare className="w-4 h-4 mr-3" />
              Messages
            </Link>
            <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
              <Wallet className="w-4 h-4 mr-3" />
              Earnings
            </Link>
            <Link to="#" className="flex items-center py-3 px-4 hover:bg-secondary transition-colors">
              <Settings className="w-4 h-4 mr-3" />
              Settings
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default DoctorSidebar;
