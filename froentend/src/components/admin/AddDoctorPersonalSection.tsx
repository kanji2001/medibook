import { FC } from 'react';
import { FieldErrors, UseFormRegister } from 'react-hook-form';
import { DoctorFormValues } from './addDoctorFormConfig';

interface AddDoctorPersonalSectionProps {
  register: UseFormRegister<DoctorFormValues>;
  errors: FieldErrors<DoctorFormValues>;
}

const AddDoctorPersonalSection: FC<AddDoctorPersonalSectionProps> = ({ register, errors }) => {
  return (
    <section className="grid gap-4 md:grid-cols-2">
      <label className="space-y-1 text-sm">
        <span className="font-medium">Full Name*</span>
        <input
          type="text"
          {...register('name')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Dr. Jane Doe"
        />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Email*</span>
        <input
          type="email"
          {...register('email')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="doctor@example.com"
        />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Temporary Password*</span>
        <input
          type="password"
          {...register('password')}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="Set an initial password"
        />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </label>

      <label className="space-y-1 text-sm">
        <span className="font-medium">Phone*</span>
        <input
          type="tel"
          inputMode="numeric"
          {...register('phone')}
          onInput={event => {
            const target = event.currentTarget;
            target.value = target.value.replace(/\D/g, '');
          }}
          className="w-full rounded-lg border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="5551234567"
        />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </label>
    </section>
  );
};

export default AddDoctorPersonalSection;

