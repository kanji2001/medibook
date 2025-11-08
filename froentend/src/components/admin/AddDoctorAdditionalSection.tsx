import { FC } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { DoctorFormValues } from './addDoctorFormConfig';

interface AddDoctorAdditionalSectionProps {
  register: UseFormRegister<DoctorFormValues>;
  errors: FieldErrors<DoctorFormValues>;
}

const AddDoctorAdditionalSection: FC<AddDoctorAdditionalSectionProps> = ({
  register,
  errors,
}) => {
  return (
    <section className="space-y-4">
      <label className="space-y-1 text-sm">
        <span className="font-medium">Professional Bio*</span>
        <textarea
          {...register('about')}
          className="w-full min-h-[100px] rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Describe the doctor's background, areas of expertise, and patient philosophy."
        />
        {errors.about && <p className="text-xs text-destructive">{errors.about.message}</p>}
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Education</span>
          <input
            type="text"
            {...register('education')}
            className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="e.g. MD - Stanford University, Residency - UCSF"
          />
          <p className="text-xs text-muted-foreground">Separate entries with commas.</p>
          {errors.education && (
            <p className="text-xs text-destructive">{errors.education.message}</p>
          )}
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Languages</span>
          <input
            type="text"
            {...register('languages')}
            className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="English, Spanish"
          />
          {errors.languages && (
            <p className="text-xs text-destructive">{errors.languages.message}</p>
          )}
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Specializations</span>
          <input
            type="text"
            {...register('specializations')}
            className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Heart Failure, Preventive Cardiology"
          />
          {errors.specializations && (
            <p className="text-xs text-destructive">{errors.specializations.message}</p>
          )}
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Insurances Accepted</span>
          <input
            type="text"
            {...register('insurances')}
            className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Aetna, Blue Shield..."
          />
          {errors.insurances && (
            <p className="text-xs text-destructive">{errors.insurances.message}</p>
          )}
        </label>
      </div>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Profile Image URL</span>
        <input
          type="url"
          {...register('image')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="https://..."
        />
        {errors.image && <p className="text-xs text-destructive">{errors.image.message}</p>}
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register('featured')} className="h-4 w-4 accent-primary" />
        <span>Feature this doctor on the home page</span>
      </label>
    </section>
  );
};

export default AddDoctorAdditionalSection;

