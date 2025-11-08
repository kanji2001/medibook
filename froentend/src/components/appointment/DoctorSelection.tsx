
import { Search, ChevronRight } from 'lucide-react';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  location: string;
}

interface DoctorSelectionProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filteredDoctors: Doctor[];
  onSelectDoctor: (doctor: Doctor) => void;
}

const DoctorSelection = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredDoctors, 
  onSelectDoctor 
}: DoctorSelectionProps) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="heading-lg text-center mb-8">Select a Doctor</h1>
      
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search for a doctor by name, specialty or location"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doctor) => (
          <div 
            key={doctor.id}
            className="glass-card-hover rounded-xl p-4 cursor-pointer"
            onClick={() => onSelectDoctor(doctor)}
          >
            <div className="flex items-center">
              <div className="shrink-0 w-16 h-16 rounded-full overflow-hidden mr-4">
                <img 
                  src={doctor.image} 
                  alt={doctor.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">{doctor.name}</h3>
                <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                <div className="flex items-center text-sm mt-1">
                  <div className="badge badge-outline mr-2">{doctor.rating.toFixed(1)} ★</div>
                  <span className="text-muted-foreground">{doctor.location}</span>
                </div>
              </div>
              <div className="ml-auto">
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
        
        {filteredDoctors.length === 0 && (
          <div className="col-span-2 text-center py-8 glass-card rounded-xl">
            <h3 className="text-lg font-semibold mb-2">No doctors found</h3>
            <p className="text-muted-foreground">Try adjusting your search to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorSelection;
