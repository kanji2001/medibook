import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import useDoctorStore, {
  doctorSpecialties,
  defaultDoctorFilters,
} from '@/stores/doctorStore';
import { useToast } from '@/hooks/use-toast';

interface QuickAppointmentFormState {
  disease: string;
  specialty: string;
  consultationType: string;
  experience: string;
  feeRange: string;
  availability: boolean;
  language: string;
}

const consultationTypeOptions = [
  { value: '', label: 'Any consultation' },
  { value: 'online', label: 'Online Consultation' },
  { value: 'clinic', label: 'In-clinic Visit' },
  { value: 'home', label: 'Home Visit' },
];

const experienceOptions = [
  { value: '', label: 'Any experience' },
  { value: '5', label: '5+ years' },
  { value: '10', label: '10+ years' },
  { value: '15', label: '15+ years' },
  { value: '20', label: '20+ years' },
];

const feeRangeOptions = [
  { value: '', label: 'Any fee' },
  { value: '0-500', label: 'Under ₹500' },
  { value: '500-1000', label: '₹500 - ₹1000' },
  { value: '1000-2000', label: '₹1000 - ₹2000' },
  { value: '2000+', label: '₹2000 and above' },
];

const languageOptions = [
  { value: '', label: 'Any language' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'gujarati', label: 'Gujarati' },
  { value: 'marathi', label: 'Marathi' },
  { value: 'tamil', label: 'Tamil' },
  { value: 'telugu', label: 'Telugu' },
  { value: 'bengali', label: 'Bengali' },
];

const QuickAppointmentForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setFilters, resetFilters, fetchDoctors } = useDoctorStore(state => ({
    setFilters: state.setFilters,
    resetFilters: state.resetFilters,
    fetchDoctors: state.fetchDoctors,
  }));

  const [formState, setFormState] = useState<QuickAppointmentFormState>({
    disease: '',
    specialty: '',
    consultationType: '',
    experience: '',
    feeRange: '',
    availability: false,
    language: '',
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    resetFilters();
    setFilters({
      query: formState.disease.trim(),
      specialty: formState.specialty || defaultDoctorFilters.specialty,
      consultationType: formState.consultationType,
      experience: formState.experience,
      feeRange: formState.feeRange,
      availability: formState.availability,
      language: formState.language,
    });

    try {
      await fetchDoctors();
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to refresh doctor results. Please try again.',
        variant: 'destructive',
      });
    }

    navigate('/doctors');
  };

  return (
    <form className="grid grid-cols-1 gap-4" onSubmit={handleSubmit}>
      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="qa-disease">
          Disease / Condition
        </label>
        <input
          id="qa-disease"
          name="disease"
          type="text"
          value={formState.disease}
          onChange={handleChange}
          placeholder="e.g. diabetes, skin rash, chest pain"
          className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="qa-specialty">
          Specialty
        </label>
        <select
          id="qa-specialty"
          name="specialty"
          value={formState.specialty}
          onChange={handleChange}
          className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Select specialty</option>
          {doctorSpecialties
            .filter(specialty => specialty !== defaultDoctorFilters.specialty)
            .map(specialty => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="qa-consultation">
            Consultation Type
          </label>
          <select
            id="qa-consultation"
            name="consultationType"
            value={formState.consultationType}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {consultationTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="qa-experience">
            Experience (Years)
          </label>
          <select
            id="qa-experience"
            name="experience"
            value={formState.experience}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {experienceOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="qa-fee">
            Consultation Fee Range
          </label>
          <select
            id="qa-fee"
            name="feeRange"
            value={formState.feeRange}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {feeRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="qa-language">
            Language
          </label>
          <select
            id="qa-language"
            name="language"
            value={formState.language}
            onChange={handleChange}
            className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {languageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="qa-availability"
          type="checkbox"
          name="availability"
          checked={formState.availability}
          onChange={handleCheckboxChange}
          className="h-4 w-4 text-primary border-input rounded focus:ring-primary/20"
        />
        <label htmlFor="qa-availability" className="text-sm">
          Available today / this week
        </label>
      </div>

      <button type="submit" className="btn-primary w-full py-3 mt-2 flex items-center justify-center">
        <Search className="w-4 h-4 mr-2" />
        Search Doctors
      </button>
    </form>
  );
};

export default QuickAppointmentForm;

