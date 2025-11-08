
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, User, Calendar, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when route changes
    setIsOpen(false);
  }, [location]);

  const getUserDashboardLink = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'patient':
        return '/patient-dashboard';
      case 'doctor':
        return '/doctor-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/login';
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="container flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-bold text-primary flex items-center space-x-2"
        >
          <span className="bg-primary text-white rounded-full p-1.5">
            <Calendar className="w-5 h-5" />
          </span>
          <span>MediBook</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/doctors" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/doctors') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Find Doctors
          </Link>
          <Link 
            to="/services" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/services') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Services
          </Link>
          <Link 
            to="/about" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/about') ? 'text-primary' : 'text-foreground'
            }`}
          >
            About
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <Link 
                to={getUserDashboardLink()} 
                className="flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
                  <img 
                    src={user?.avatar || "https://ui-avatars.com/api/?name=User"}
                    alt={user?.name || "User"} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <span>Dashboard</span>
              </Link>
              <button
                onClick={logout}
                className="btn-outline py-2 px-3 flex items-center"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-outline py-2 px-4">
                <User className="w-4 h-4 mr-2" />
                <span>Login</span>
              </Link>
              <Link to="/appointment" className="btn-primary py-2 px-4">Book Appointment</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-foreground focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`
          fixed inset-0 z-40 flex flex-col pt-24 pb-8 px-6 bg-white/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out md:hidden
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex flex-col space-y-6 text-center">
          <Link 
            to="/" 
            className={`text-lg font-medium py-2 border-b border-border ${
              isActive('/') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/doctors" 
            className={`text-lg font-medium py-2 border-b border-border ${
              isActive('/doctors') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Find Doctors
          </Link>
          <Link 
            to="/services" 
            className={`text-lg font-medium py-2 border-b border-border ${
              isActive('/services') ? 'text-primary' : 'text-foreground'
            }`}
          >
            Services
          </Link>
          <Link 
            to="/about" 
            className={`text-lg font-medium py-2 border-b border-border ${
              isActive('/about') ? 'text-primary' : 'text-foreground'
            }`}
          >
            About
          </Link>
          
          <div className="pt-4 flex flex-col space-y-4">
            {isAuthenticated ? (
              <>
                <Link to={getUserDashboardLink()} className="btn-primary py-3">
                  <User className="w-4 h-4 mr-2" />
                  <span>Dashboard</span>
                </Link>
                <button onClick={logout} className="btn-outline py-3">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline py-3">
                  <User className="w-4 h-4 mr-2" />
                  <span>Login</span>
                </Link>
                <Link to="/appointment" className="btn-primary py-3">Book Appointment</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
