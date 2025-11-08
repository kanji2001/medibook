
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronRight } from 'lucide-react';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const patientInfoSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .regex(emailRegex, 'Enter a valid email address'),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, 'Phone number must be exactly 10 digits'),
  reason: z.string().trim().min(1, 'Please select a reason for visit'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or less')
    .optional()
    .transform(value => value?.trim() ?? ''),
});

export type PatientFormData = z.infer<typeof patientInfoSchema>;

interface PatientInfoFormProps {
  defaultValues: PatientFormData;
  onSubmit: (values: PatientFormData) => Promise<void> | void;
  onBack: () => void;
}

const PatientInfoForm = ({ defaultValues, onSubmit, onBack }: PatientInfoFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientInfoSchema),
    defaultValues,
    mode: 'onBlur',
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onFormSubmit = async (values: PatientFormData) => {
    await onSubmit(values);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="heading-lg text-center mb-8">Patient Information</h1>
      
      <div className="glass-card rounded-xl p-6 mb-6">
        <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="firstName">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-invalid={errors.firstName ? 'true' : 'false'}
                {...register('firstName')}
              />
              {errors.firstName ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.firstName.message}
                </p>
              ) : null}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="lastName">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-invalid={errors.lastName ? 'true' : 'false'}
                {...register('lastName')}
              />
              {errors.lastName ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.lastName.message}
                </p>
              ) : null}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-invalid={errors.email ? 'true' : 'false'}
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    aria-invalid={errors.phone ? 'true' : 'false'}
                    {...field}
                    onChange={event => {
                      const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 10);
                      field.onChange(digitsOnly);
                    }}
                  />
                )}
              />
              {errors.phone ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.phone.message}
                </p>
              ) : null}
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="reason">
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <select
              id="reason"
              name="reason"
              className="w-full h-12 px-4 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              aria-invalid={errors.reason ? 'true' : 'false'}
              {...register('reason')}
            >
              <option value="">Select a reason</option>
              <option value="New Patient Consultation">New Patient Consultation</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Annual Check-up">Annual Check-up</option>
              <option value="Specific Concern">Specific Concern</option>
              <option value="Other">Other</option>
            </select>
            {errors.reason ? (
              <p className="mt-1 text-sm text-red-500" role="alert">
                {errors.reason.message}
              </p>
            ) : null}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-1" htmlFor="notes">
              Additional Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              className="w-full px-4 py-3 rounded-md border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                aria-invalid={errors.notes ? 'true' : 'false'}
                {...register('notes')}
              placeholder="Please share any specific concerns or information that might be helpful for the doctor."
              ></textarea>
              {errors.notes ? (
                <p className="mt-1 text-sm text-red-500" role="alert">
                  {errors.notes.message}
                </p>
              ) : null}
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              type="button"
              className="btn-outline"
              onClick={onBack}
            >
              Back
            </button>
            <button 
              type="submit"
              className="btn-primary flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Request Appointment'}
              <ChevronRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientInfoForm;
