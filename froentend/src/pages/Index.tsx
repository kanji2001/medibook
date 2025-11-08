
import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/home/Hero';
import FeaturedDoctors from '@/components/home/FeaturedDoctors';
import HowItWorks from '@/components/home/HowItWorks';
import ChatBot from '@/components/ui/ChatBot';
import { Medal, Clock, CreditCard, HeartPulse, ArrowRight, ChevronRight } from 'lucide-react';
import useDoctorStore from '@/stores/doctorStore';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  useEffect(() => {
    // Scroll to top when page loads
    window.scrollTo(0, 0);
  }, []);

  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { doctors, loading, lastFetchedAt, fetchDoctors } = useDoctorStore(state => ({
    doctors: state.doctors,
    loading: state.loading,
    lastFetchedAt: state.lastFetchedAt,
    fetchDoctors: state.fetchDoctors,
  }));

  useEffect(() => {
    if (!lastFetchedAt) {
      fetchDoctors().catch(() => {
        toast({
          title: 'Error loading doctors',
          description: 'We could not refresh the doctor list. Please try again later.',
          variant: 'destructive',
        });
      });
    }
  }, [lastFetchedAt, fetchDoctors, toast]);

  const specialtyStats = useMemo(() => {
    if (!doctors.length) return [];
    const counts = new Map<string, number>();
    doctors.forEach(doctor => {
      const key = doctor.specialty?.trim();
      if (!key) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [doctors]);

  const fallbackSpecialties = [
    { name: 'Cardiology', count: 0 },
    { name: 'Dermatology', count: 0 },
    { name: 'Neurology', count: 0 },
    { name: 'Pediatrics', count: 0 },
    { name: 'Orthopedics', count: 0 },
    { name: 'Ophthalmology', count: 0 },
    { name: 'Gynecology', count: 0 },
    { name: 'Psychiatry', count: 0 },
  ];

  const displayedSpecialties = specialtyStats.length ? specialtyStats : fallbackSpecialties;

  const benefits = [
    {
      icon: <Medal className="w-10 h-10" />,
      title: "Certified Specialists",
      description: "All doctors are verified and certified in their specialties."
    },
    {
      icon: <Clock className="w-10 h-10" />,
      title: "Save Time",
      description: "No more waiting on phone lines to book appointments."
    },
    {
      icon: <CreditCard className="w-10 h-10" />,
      title: "Secure Payments",
      description: "Safe and encrypted payment processing for consultations."
    },
    {
      icon: <HeartPulse className="w-10 h-10" />,
      title: "Quality Care",
      description: "Access to top-rated healthcare professionals nationwide."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* Benefits Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index} 
                  className="glass-card-hover rounded-xl p-6 flex flex-col items-center text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Featured Doctors Section */}
        <FeaturedDoctors />

        {/* Specialties Section */}
        <section className="py-16 bg-white">
          <div className="container">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="heading-lg">Find Specialists Across All Medical Fields</h2>
                <p className="text-muted-foreground">
                  Whatever your health needs, we have specialists ready to help. Browse by specialty or condition to find the perfect doctor for your needs.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  {loading && !doctors.length
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border border-border rounded-lg p-3"
                        >
                          <Skeleton className="h-5 w-24" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))
                    : displayedSpecialties.map((specialty, index) => (
                        <Link
                          key={index}
                          to={`/doctors?specialty=${encodeURIComponent(specialty.name)}`}
                          className="flex items-center justify-between border border-border rounded-lg p-3 hover:bg-secondary/50 transition-colors"
                        >
                          <span className="font-medium">{specialty.name}</span>
                          <span className="badge badge-outline">
                            {specialty.count} {specialty.count === 1 ? 'doctor' : 'doctors'}
                          </span>
                        </Link>
                      ))}
                </div>
                
                <div className="pt-4">
                  <Link to="/doctors" className="flex items-center text-primary font-medium hover:underline">
                    <span>View all specialties</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-400/20 rounded-2xl blur-3xl opacity-70"></div>
                <img 
                  src="https://images.unsplash.com/photo-1638202993928-7d113vlipde?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80" 
                  alt="Medical specialties" 
                  className="relative rounded-xl w-full h-auto object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {!isAuthenticated && (
          <section className="py-20 bg-gradient-to-r from-primary/10 to-blue-400/10">
            <div className="container">
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="heading-lg mb-4">Ready to Experience Better Healthcare?</h2>
                <p className="text-muted-foreground mb-8">
                  Join thousands of patients who have simplified their healthcare journey with MediBook's easy appointment booking.
                </p>
                <Link to="/register" className="btn-primary inline-flex">
                  Get Started Now
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Index;
