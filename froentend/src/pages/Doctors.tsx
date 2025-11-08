
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import DoctorCard from '@/components/ui/DoctorCard';
import { Search, Filter, X } from 'lucide-react';
import { doctorService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const specialties = [
  "All Specialties", "Cardiologist", "Neurologist", "Dermatologist", 
  "Orthopedic Surgeon", "Pediatrician", "Psychiatrist", "Gynecologist", "Ophthalmologist"
];

const Doctors = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialties');
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const specialtyParam = searchParams.get('specialty');
    
    if (specialtyParam) {
      const matchedSpecialty = specialties.find(s => 
        s.toLowerCase() === specialtyParam.toLowerCase() ||
        s.toLowerCase().includes(specialtyParam.toLowerCase())
      );
      
      if (matchedSpecialty) {
        setSelectedSpecialty(matchedSpecialty);
      }
    }
  }, [location.search]);

  useEffect(() => {
    const getDoctors = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Prepare filter params
        const filters: any = {};
        if (selectedSpecialty !== 'All Specialties') {
          filters.specialty = selectedSpecialty;
        }
        
        // Fetch doctors from API
        const doctors = await doctorService.getAllDoctors(filters);
        
        // Apply client-side search filter if needed
        let results = doctors;
        if (searchTerm) {
          results = results.filter((doctor: any) => 
            doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doctor.location.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        setFilteredDoctors(results);
      } catch (err: any) {
        console.error('Failed to fetch doctors:', err);
        setError('Failed to load doctors. Please try again later.');
        toast({
          title: "Error",
          description: "Failed to load doctors. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getDoctors();
    window.scrollTo(0, 0);
  }, [selectedSpecialty, searchTerm, toast]);

  useEffect(() => {
    if (selectedSpecialty !== 'All Specialties') {
      navigate(`/doctors?specialty=${selectedSpecialty}`, { replace: true });
    } else {
      navigate('/doctors', { replace: true });
    }
  }, [selectedSpecialty, navigate]);

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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchTerm && (
                    <button
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setSearchTerm('')}
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
                    <button 
                      onClick={() => setIsFilterOpen(false)}
                      className="p-2 rounded-full hover:bg-secondary"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-sm font-medium mb-3">Specialty</h4>
                      <div className="space-y-2">
                        {specialties.map((specialty) => (
                          <button
                            key={specialty}
                            onClick={() => {
                              setSelectedSpecialty(specialty);
                              setIsFilterOpen(false);
                            }}
                            className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                              selectedSpecialty === specialty
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-secondary'
                            }`}
                          >
                            {specialty}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 glass-card rounded-xl p-5 space-y-6">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-3">Specialty</h4>
                    <div className="space-y-2">
                      {specialties.map((specialty) => (
                        <button
                          key={specialty}
                          onClick={() => setSelectedSpecialty(specialty)}
                          className={`block w-full text-left px-3 py-2 rounded-md transition-colors ${
                            selectedSpecialty === specialty
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-secondary'
                          }`}
                        >
                          {specialty}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    {!isLoading && !error && (
                      <h2 className="text-xl font-semibold">
                        {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
                      </h2>
                    )}
                    {(searchTerm || selectedSpecialty !== 'All Specialties') && (
                      <div className="flex items-center mt-2 text-sm text-muted-foreground">
                        <span>Filtered by:</span>
                        {selectedSpecialty !== 'All Specialties' && (
                          <span className="ml-2 bg-secondary px-2 py-1 rounded-md flex items-center">
                            {selectedSpecialty}
                            <button 
                              onClick={() => setSelectedSpecialty('All Specialties')}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )}
                        {searchTerm && (
                          <span className="ml-2 bg-secondary px-2 py-1 rounded-md flex items-center">
                            "{searchTerm}"
                            <button 
                              onClick={() => setSearchTerm('')}
                              className="ml-1 text-muted-foreground hover:text-foreground"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        )}
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
                
                {isLoading ? (
                  <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading doctors...</p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 glass-card rounded-xl">
                    <h3 className="text-lg font-semibold mb-2">Error</h3>
                    <p className="text-muted-foreground mb-4">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="btn-outline"
                    >
                      Try Again
                    </button>
                  </div>
                ) : filteredDoctors.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg-:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredDoctors.map((doctor) => (
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
