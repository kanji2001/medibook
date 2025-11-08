
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorCard from '../ui/DoctorCard';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { doctorService } from '@/services/api';

const FeaturedDoctors = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch featured doctors
  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        // Fetch doctors with featured filter
        const allDoctors = await doctorService.getAllDoctors({ featured: true });
        setDoctors(allDoctors);
        setError(null);
      } catch (err) {
        console.error('Error loading featured doctors:', err);
        setError('Failed to load featured doctors');
      } finally {
        setLoading(false);
      }
    };

    loadDoctors();
  }, []);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer for rounding errors
    }
  };

  useEffect(() => {
    const currentRef = carouselRef.current;
    if (currentRef) {
      currentRef.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();
      
      // Check again after images load
      window.addEventListener('load', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
    }
    
    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('load', checkScrollButtons);
      window.removeEventListener('resize', checkScrollButtons);
    };
  }, [doctors]); // Add doctors as dependency to recheck when they load

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const { clientWidth } = carouselRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth / 2 : clientWidth / 2;
      
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
      
      // Check scroll position after animation
      setTimeout(checkScrollButtons, 400);
    }
  };

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
          <div className="space-y-2 max-w-xl">
            <h2 className="heading-lg">Our Featured Doctors</h2>
            <p className="text-muted-foreground">
              Meet our highly rated healthcare professionals, ready to provide exceptional care for you and your family.
            </p>
          </div>
          <div className="flex mt-4 md:mt-0 space-x-2">
            <button 
              onClick={() => scroll('left')}
              disabled={!canScrollLeft || loading}
              className="p-2 rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              disabled={!canScrollRight || loading}
              className="p-2 rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden">
          {loading ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading featured doctors...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 glass-card rounded-xl">
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : (
            <div 
              ref={carouselRef}
              className="flex overflow-x-auto scrollbar-none -mx-4 px-4 pb-4 pt-2 scroll-px-4 snap-x"
            >
              {doctors.map((doctor) => (
                <div 
                  key={doctor.id} 
                  className="flex-none w-full sm:w-[calc(50%-16px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-16px)] px-2 snap-start"
                >
                  <div className="h-full flex flex-col">
                    <DoctorCard {...doctor} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDoctors;
