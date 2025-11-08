import { FC } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { DoctorFormValues } from './addDoctorFormConfig';

interface AddDoctorProfessionalSectionProps {
  register: UseFormRegister<DoctorFormValues>;
  errors: FieldErrors<DoctorFormValues>;
}

const AddDoctorProfessionalSection: FC<AddDoctorProfessionalSectionProps> = ({
  register,
  errors,
}) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1 text-sm">
        <span className="font-medium">Specialty*</span>
        <input
          type="text"
          {...register('specialty')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Cardiology"
        />
        {errors.specialty && (
          <p className="text-xs text-destructive">{errors.specialty.message}</p>
        )}
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Years of Experience*</span>
        <input
          type="number"
          min="0"
          {...register('experience', { valueAsNumber: true })}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="10"
        />
        {errors.experience && (
          <p className="text-xs text-destructive">{errors.experience.message}</p>
        )}
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Location*</span>
        <input
          type="text"
          {...register('location')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="San Francisco, CA"
        />
        {errors.location && (
          <p className="text-xs text-destructive">{errors.location.message}</p>
        )}
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Clinic Address*</span>
        <input
          type="text"
          {...register('address')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="123 Health St."
        />
        {errors.address && (
          <p className="text-xs text-destructive">{errors.address.message}</p>
        )}
      </label>
    </section>
  );
};

export default AddDoctorProfessionalSection;

