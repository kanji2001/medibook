import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorCard from '@/components/ui/DoctorCard';
import { Search, Filter, X } from 'lucide-react';
import useDoctorStore, {
  DoctorFilters,
  doctorSpecialties,
  findMatchingSpecialty,
} from '@/stores/doctorStore';
import { useToast } from '@/hooks/use-toast';

const formatFiltersForUrl = (filters: DoctorFilters) => {
  const params = new URLSearchParams();

  if (filters.query) params.set('q', filters.query);
  if (filters.specialty && filters.specialty !== 'All Specialties') {
    params.set('specialty', filters.specialty);
  }
  if (filters.consultationType) params.set('consultationType', filters.consultationType);
  if (filters.experience) params.set('experience', filters.experience);
  if (filters.feeRange) params.set('feeRange', filters.feeRange);
  if (filters.availability) params.set('availability', 'true');
  if (filters.language) params.set('language', filters.language);

  return params.toString();
};

const Doctors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const {
    filteredDoctors,
    filters,
    loading,
    error,
    lastFetchedAt,
    fetchDoctors,
    setFilters,
    resetFilters,
  } = useDoctorStore(state => ({
    filteredDoctors: state.filteredDoctors,
    filters: state.filters,
    loading: state.loading,
    error: state.error,
    lastFetchedAt: state.lastFetchedAt,
    fetchDoctors: state.fetchDoctors,
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
  }));

  useEffect(() => {
    if (!lastFetchedAt) {
      fetchDoctors().catch(() => {
        toast({
          title: 'Error',
          description: 'Failed to load doctors. Please try again later.',
          variant: 'destructive',
        });
      });
    }
  }, [fetchDoctors, lastFetchedAt, toast]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const incoming: Partial<DoctorFilters> = {};

    const queryParam = params.get('q') || '';
    if (queryParam !== filters.query) incoming.query = queryParam;

    const specialtyParam = findMatchingSpecialty(params.get('specialty'));
    if (specialtyParam !== filters.specialty) incoming.specialty = specialtyParam;

    const consultationTypeParam = params.get('consultationType') || '';
    if (consultationTypeParam !== filters.consultationType) {
      incoming.consultationType = consultationTypeParam;
    }

    const experienceParam = params.get('experience') || '';
    if (experienceParam !== filters.experience) incoming.experience = experienceParam;

    const feeRangeParam = params.get('feeRange') || '';
    if (feeRangeParam !== filters.feeRange) incoming.feeRange = feeRangeParam;

    const availabilityParam = params.get('availability') === 'true';
    if (availabilityParam !== filters.availability) incoming.availability = availabilityParam;

    const languageParam = params.get('language') || '';
    if (languageParam !== filters.language) incoming.language = languageParam;

    if (Object.keys(incoming).length > 0) {
      setFilters(incoming);
    }
  }, [location.search, filters, setFilters]);

  const handleSpecialtySelect = (specialty: string) => {
    setFilters({ specialty });
  };

  const toggleAvailabilityFilter = () => {
    setFilters({ availability: !filters.availability });
  };

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; onClear: () => void }[] = [];

    if (filters.specialty && filters.specialty !== 'All Specialties') {
      chips.push({
        label: filters.specialty,
        onClear: () => setFilters({ specialty: 'All Specialties' }),
      });
    }

    if (filters.query) {
      chips.push({
        label: `"${filters.query}"`,
        onClear: () => setFilters({ query: '' }),
      });
    }

    if (filters.consultationType) {
      chips.push({
        label: `Consultation: ${filters.consultationType}`,
        onClear: () => setFilters({ consultationType: '' }),
      });
    }

    if (filters.experience) {
      chips.push({
        label: `${filters.experience}+ years`,
        onClear: () => setFilters({ experience: '' }),
      });
    }

    if (filters.feeRange) {
      chips.push({
        label: `Fee ${filters.feeRange}`,
        onClear: () => setFilters({ feeRange: '' }),
      });
    }

    if (filters.language) {
      chips.push({
        label: `Language: ${filters.language}`,
        onClear: () => setFilters({ language: '' }),
      });
    }

    if (filters.availability) {
      chips.push({
        label: 'Available today / this week',
        onClear: () => setFilters({ availability: false }),
      });
    }

    return chips;
  }, [filters, setFilters]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24">
        <section className="bg-gradient-to-r from-primary/10 to-blue-400/10 py-12">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="heading-lg mb-4">Find the Right Doctor for You</h1>
              <p className="text-muted-foreground mb-8">
                Search from our network of qualified healthcare professionals to find the perfect match for your needs.
              </p>

              <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-3 max-w-xl mx-auto">
                <div className="w-full relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, specialty or location"
                    value={filters.query}
                    onChange={event => setFilters({ query: event.target.value })}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {filters.query && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setFilters({ query: '' })}
                    >
                      <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>
                <button
                  className="sm:hidden w-full btn-outline py-3 flex items-center justify-center"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Filter
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-8">
              {isFilterOpen && (
                <div className="lg:hidden fixed inset-0 z-40 bg-white p-6 overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">Filters</h3>
                    <button onClick={() => setIsFilterOpen(false)} className="p-2 rounded-full hover:bg-secondary">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Specialty</h4>
                      <div className="space-y-2">
                        {doctorSpecialties.map(specialty => (
                          <button
                            key={specialty}
                            onClick={() => {
                              handleSpecialtySelect(specialty);
                              setIsFilterOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                              filters.specialty === specialty ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                            }`}
                          >
                            {specialty}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        id="availability-mobile"
                        type="checkbox"
                        checked={filters.availability}
                        onChange={toggleAvailabilityFilter}
                        className="h-4 w-4 text-primary border-input rounded focus:ring-primary/20"
                      />
                      <label htmlFor="availability-mobile" className="text-sm">
                        Available today / this week
                      </label>
                    </div>

                    <button
                      onClick={() => {
                        resetFilters();
                        setIsFilterOpen(false);
                      }}
                      className="btn-outline w-full"
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              )}

              <div className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 glass-card rounded-xl p-5 space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>

                  <div>
                    <h4 className="text-sm font-medium mb-3">Specialty</h4>
                    <div className="space-y-2">
                      {doctorSpecialties.map(specialty => (
                        <button
                          key={specialty}
                          onClick={() => handleSpecialtySelect(specialty)}
                          className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                            filters.specialty === specialty ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'
                          }`}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      id="availability-desktop"
                      type="checkbox"
                      checked={filters.availability}
                      onChange={toggleAvailabilityFilter}
                      className="h-4 w-4 text-primary border-input rounded focus:ring-primary/20"
                    />
                    <label htmlFor="availability-desktop" className="text-sm">
                      Available today / this week
                    </label>
                  </div>

                  <button onClick={resetFilters} className="btn-outline w-full mt-4">
                    Reset filters
                  </button>
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    {!loading && !error && (
                      <h2 className="text-xl font-semibold">
                        {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
                      </h2>
                    )}
                    {activeFilterChips.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <span>Filtered by:</span>
                        {activeFilterChips.map(chip => (
                          <span key={chip.label} className="bg-secondary px-3 py-1 rounded-md flex items-center gap-2">
                            {chip.label}
                            <button onClick={chip.onClear} className="text-muted-foreground hover:text-foreground">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="hidden lg:block">
                    <button className="btn-outline py-2">
                      <Filter className="h-4 w-4 mr-2" />
                      Sort by: Relevance
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="mt-4 text-muted-foreground">Loading doctors...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button
                      onClick={() =>
                        fetchDoctors().catch(() =>
                          toast({
                            title: 'Error',
                            description: 'Failed to load doctors. Please try again later.',
                            variant: 'destructive',
                          }),
                        )
                      }
                      className="btn-outline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDoctors.map(doctor => (
                      <div key={doctor.id} className="animate-fade-in h-[600px]">
                        <DoctorCard {...doctor} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Doctors;

