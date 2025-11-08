import { create } from 'zustand';
import { doctorService } from '@/services/api';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  availability: string;
  availabilityStatus: string;
  experience: number;
  featured?: boolean;
  languages?: string[];
  consultationTypes: string[];
  consultationFee: number;
  specializations?: string[];
  about?: string;
}

export interface DoctorFilters {
  query: string;
  specialty: string;
  consultationType: string;
  experience: string;
  feeRange: string;
  availability: boolean;
  language: string;
}

export const doctorSpecialties = [
  'All Specialties',
  'Cardiologist',
  'Neurologist',
  'Dermatologist',
  'Orthopedic Surgeon',
  'Pediatrician',
  'Psychiatrist',
  'Gynecologist',
  'Ophthalmologist',
];

export const defaultDoctorFilters: DoctorFilters = {
  query: '',
  specialty: 'All Specialties',
  consultationType: '',
  experience: '',
  feeRange: '',
  availability: false,
  language: '',
};

const normalize = (value: string | null | undefined) => (value ? value.toLowerCase() : '');

export const findMatchingSpecialty = (value: string | null) => {
  if (!value) return defaultDoctorFilters.specialty;
  const normalized = value.toLowerCase();
  return (
    doctorSpecialties.find(
      specialty =>
        specialty.toLowerCase() === normalized || specialty.toLowerCase().includes(normalized),
    ) || defaultDoctorFilters.specialty
  );
};

const parseFeeRange = (range: string) => {
  if (!range) {
    return { min: undefined as number | undefined, max: undefined as number | undefined };
  }

  if (range.includes('-')) {
    const [minStr, maxStr] = range.split('-');
    return {
      min: Number(minStr),
      max: Number(maxStr),
    };
  }

  if (range.endsWith('+')) {
    const min = Number(range.replace('+', ''));
    return { min, max: undefined };
  }

  return { min: undefined, max: undefined };
};

const matchesFeeRange = (feePaise: number | undefined, range: string) => {
  if (!range) return true;
  const { min, max } = parseFeeRange(range);
  const feeInRupees = (feePaise ?? 0) / 100;

  if (typeof min === 'number' && !Number.isNaN(min) && feeInRupees < min) {
    return false;
  }
  if (typeof max === 'number' && !Number.isNaN(max) && feeInRupees > max) {
    return false;
  }
  return true;
};

const deriveConsultationTypes = (doctor: Doctor) =>
  doctor.consultationTypes || ((doctor.languages || []).length > 1 ? ['online', 'clinic'] : ['clinic']);

const estimateConsultationFee = (doctor: Doctor) =>
  doctor.consultationFee ?? Math.max(500, (doctor.experience || 0) * 120);

const applyFilters = (doctors: Doctor[], filters: DoctorFilters) => {
  const loweredQuery = filters.query.toLowerCase();
  const specialtyFilter = filters.specialty.toLowerCase();
  const consultationTypeFilter = filters.consultationType.toLowerCase();
  const languageFilter = filters.language.toLowerCase();
  const availabilityFilter = filters.availability;
  const experienceFilter = Number(filters.experience);

  return doctors.filter(doctor => {
    if (
      filters.specialty !== defaultDoctorFilters.specialty &&
      normalize(doctor.specialty) !== specialtyFilter
    ) {
      return false;
    }

    if (loweredQuery) {
      const specializations = (doctor.specializations || []).join(' ');
      const about = doctor.about || '';
      const searchSpace = `${doctor.name} ${doctor.specialty} ${doctor.location} ${specializations} ${about}`;
      if (!searchSpace.toLowerCase().includes(loweredQuery)) {
        return false;
      }
    }

    if (consultationTypeFilter) {
      const doctorConsultationTypes = deriveConsultationTypes(doctor).map(type => type.toLowerCase());
      if (!doctorConsultationTypes.includes(consultationTypeFilter)) {
        return false;
      }
    }

    if (filters.experience && !Number.isNaN(experienceFilter)) {
      if ((doctor.experience || 0) < experienceFilter) {
        return false;
      }
    }

    if (filters.feeRange) {
      if (!matchesFeeRange(estimateConsultationFee(doctor), filters.feeRange)) {
        return false;
      }
    }

    if (availabilityFilter) {
      if (normalize(doctor.availabilityStatus) !== 'available') {
        return false;
      }
    }

    if (languageFilter) {
      const languages = (doctor.languages || []).map(language => language.toLowerCase());
      if (!languages.includes(languageFilter)) {
        return false;
      }
    }

    return true;
  });
};

interface DoctorStore {
  doctors: Doctor[];
  filteredDoctors: Doctor[];
  filters: DoctorFilters;
  loading: boolean;
  error: string | null;
  lastFetchedAt: number | null;
  fetchDoctors: () => Promise<void>;
  setFilters: (updates: Partial<DoctorFilters>) => void;
  resetFilters: () => void;
}

const useDoctorStore = create<DoctorStore>((set, get) => ({
  doctors: [],
  filteredDoctors: [],
  filters: { ...defaultDoctorFilters },
  loading: false,
  error: null,
  lastFetchedAt: null,

  fetchDoctors: async () => {
    const { filters } = get();
    set({ loading: true, error: null });
    try {
      const rawDoctors = await doctorService.getAllDoctors();
      const normalizedDoctors = rawDoctors.map((doctor: Doctor) => {
        const availabilityStatus =
          doctor.availabilityStatus ||
          (normalize(doctor.availability) === 'available' ? 'available' : 'unavailable');

        const availabilityLabel =
          doctor.availability ||
          (availabilityStatus === 'available' ? 'Available today' : 'Next available soon');

        const consultationTypes = deriveConsultationTypes(doctor);

        return {
          ...doctor,
          experience: doctor.experience ?? 0,
          availability: availabilityLabel,
          availabilityStatus,
          consultationTypes,
          consultationFee: estimateConsultationFee(doctor),
          reviews: doctor.reviews ?? 0,
        };
      });

      set({
        doctors: normalizedDoctors,
        filteredDoctors: applyFilters(normalizedDoctors, filters),
        loading: false,
        lastFetchedAt: Date.now(),
      });
    } catch (error: any) {
      set({
        loading: false,
        error: error?.message || 'Failed to load doctors.',
      });
      throw error;
    }
  },

  setFilters: (updates) => {
    set(state => {
      const mergedFilters: DoctorFilters = {
        ...state.filters,
        ...updates,
      };

      if (updates.specialty) {
        mergedFilters.specialty = findMatchingSpecialty(updates.specialty);
      }

      return {
        filters: mergedFilters,
        filteredDoctors: applyFilters(state.doctors, mergedFilters),
      };
    });
  },

  resetFilters: () => {
    set(state => {
      const nextFilters = { ...defaultDoctorFilters };
      return {
        filters: nextFilters,
        filteredDoctors: applyFilters(state.doctors, nextFilters),
      };
    });
  },
}));

export default useDoctorStore;

