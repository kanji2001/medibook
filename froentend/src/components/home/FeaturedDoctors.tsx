
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DoctorCard from '../ui/DoctorCard';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { doctorService } from '@/services/api';

const FeaturedDoctors = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isCarouselView, setIsCarouselView] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : true
  );

  useEffect(() => {
    const updateViewMode = () => {
      setIsCarouselView(window.innerWidth < 1024);
    };

    updateViewMode();
    window.addEventListener('resize', updateViewMode);
    return () => window.removeEventListener('resize', updateViewMode);
  }, []);

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
    if (!isCarouselView) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer for rounding errors
    }
  };

  useEffect(() => {
    const currentRef = carouselRef.current;

    if (currentRef && isCarouselView) {
      currentRef.addEventListener('scroll', checkScrollButtons);
      // Initial check
      checkScrollButtons();

      // Check again after images load
      window.addEventListener('load', checkScrollButtons);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener('scroll', checkScrollButtons);
      }
      window.removeEventListener('load', checkScrollButtons);
    };
  }, [doctors, isCarouselView]);

  const scroll = (direction: 'left' | 'right') => {
    if (!isCarouselView || !carouselRef.current) {
      return;
    }

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
          {isCarouselView && (
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
          )}
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
              className={`-mx-4 px-4 pb-4 pt-2 ${
                isCarouselView
                  ? 'flex overflow-x-auto scrollbar-none scroll-px-4 snap-x space-x-4'
                  : 'grid overflow-visible lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6'
              }`}
            >
              {doctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`px-2 ${
                    isCarouselView
                      ? 'flex-none min-w-[270px] sm:min-w-[320px] md:min-w-[340px] snap-start'
                      : 'w-full'
                  }`}
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
