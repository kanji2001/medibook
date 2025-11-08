import { FC, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DoctorFormValues,
  DoctorPayload,
  doctorSchema,
  toArray,
} from './addDoctorFormConfig';
import AddDoctorPersonalSection from './AddDoctorPersonalSection';
import AddDoctorProfessionalSection from './AddDoctorProfessionalSection';
import AddDoctorAdditionalSection from './AddDoctorAdditionalSection';

interface AddDoctorModalProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: DoctorPayload) => Promise<void>;
}

const AddDoctorModal: FC<AddDoctorModalProps> = ({ open, onClose, onSubmit, loading }) => {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      specialty: '',
      experience: 0,
      phone: '',
      location: '',
      address: '',
      about: '',
      education: '',
      languages: '',
      specializations: '',
      insurances: '',
      image: '',
      featured: false,
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
      setServerError(null);
    }
  }, [open, reset]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (loading) return;
    reset();
    setServerError(null);
    onClose();
  };

  const onFormSubmit = async (values: DoctorFormValues) => {
    const payload: DoctorPayload = {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      specialty: values.specialty.trim(),
      experience: values.experience,
      phone: values.phone.trim(),
      location: values.location.trim(),
      address: values.address.trim(),
      about: values.about.trim(),
      education: toArray(values.education),
      languages: toArray(values.languages),
      specializations: toArray(values.specializations),
      insurances: toArray(values.insurances),
      image: values.image?.trim() || undefined,
      featured: values.featured,
    };

    try {
      setServerError(null);
      await onSubmit(payload);
      reset();
    } catch (error: any) {
      setServerError(error?.message || 'Unable to create doctor. Please try again.');
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-3xl rounded-2xl bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">Add Doctor</h2>
            <p className="text-sm text-muted-foreground">
              Create a new doctor account with profile details.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="btn-outline px-3 py-1 text-sm"
            disabled={loading}
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="max-h-[75vh] space-y-6 overflow-y-auto px-6 py-6"
        >
          <AddDoctorPersonalSection register={register} errors={errors} />

          <AddDoctorProfessionalSection register={register} errors={errors} />

          <AddDoctorAdditionalSection register={register} errors={errors} />

          {serverError && (
            <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {serverError}
            </p>
          )}

          <footer className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="btn-outline px-4 py-2 text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-4 py-2 text-sm"
              disabled={loading || isSubmitting}
            >
              {loading || isSubmitting ? 'Creating...' : 'Create Doctor'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};

export default AddDoctorModal;

