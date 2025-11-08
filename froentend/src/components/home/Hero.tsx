import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import { Search, Calendar, CheckCircle, ChevronRight } from 'lucide-react';

const Hero = () => {
  const navigate = useNavigate(); // Initialize navigate

  const [currentIndex, setCurrentIndex] = useState(0);
  const backgroundImages = [
    'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2080&q=80',
    'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handleSearch = () => {
    navigate('/doctors'); // Navigate to the search doctors page
  };

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Images */}
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8)), url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: currentIndex === index ? 1 : 0,
            zIndex: currentIndex === index ? 0 : -10
          }}
        />
      ))}

      {/* Content */}
      <div className="container relative z-10 pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 animate-fade-in">
            <h1 className="heading-xl text-balance animate-fade-in">
              Your Health, <span className="text-gradient">Our Priority</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mt-4 animate-fade-in">
              Book appointments with top specialists effortlessly. Quality healthcare is just a few clicks away.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
              <Link to="/doctors" className="btn-primary">
                Find a Doctor
                <ChevronRight className="ml-2 w-4 h-4" />
              </Link>
              <Link to="/appointment" className="btn-outline">
                Book Appointment
              </Link>
            </div>
          </div>

          {/* Quick Appointment Form */}
          <div className="hidden lg:block animate-fade-in">
            <div className="glass-card rounded-2xl p-6 shadow-xl max-w-md mx-auto">
              <h3 className="text-lg font-semibold mb-4">Quick Appointment</h3>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Specialty</label>
                  <select className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20">
                    <option value="">Select specialty</option>
                    <option value="cardiology">Cardiology</option>
                    <option value="dermatology">Dermatology</option>
                    <option value="neurology">Neurology</option>
                    <option value="orthopedics">Orthopedics</option>
                    <option value="pediatrics">Pediatrics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Location</label>
                  <input 
                    type="text" 
                    placeholder="Enter city or zip code" 
                    className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input 
                    type="date" 
                    className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button 
                  type="button" 
                  className="btn-primary w-full py-3 mt-2 flex items-center justify-center"
                  onClick={handleSearch} // Call handleSearch function on click
                >
                  <Search className="w-4 h-4 mr-2" />
                  Search Doctors
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
        <div className="text-xs font-medium text-muted-foreground mb-2">Scroll to explore</div>
        <div className="w-5 h-9 border-2 border-muted-foreground/50 rounded-full flex justify-center">
          <div className="w-1 h-2 bg-muted-foreground rounded-full mt-1 animate-float" />
        </div>
      </div>
    </div>
  );
};

export default Hero;
