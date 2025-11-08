import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const phoneRegex = /^[0-9()+\-.\s]{7,}$/;
const urlRegex = /^https?:\/\/.+/i;

const doctorProfileSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email(),
  phone: z
    .string()
    .optional()
    .transform(value => value?.trim() ?? '')
    .refine(value => !value || phoneRegex.test(value), { message: 'Enter a valid phone number' }),
  specialty: z.string().min(2, 'Specialty is required'),
  experience: z
    .string()
    .min(1, 'Experience is required')
    .refine(value => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: 'Experience must be a positive number',
    }),
  location: z.string().min(2, 'Practice location is required'),
  address: z.string().min(2, 'Clinic address is required'),
  about: z.string().min(10, 'Tell patients a little more about yourself'),
  education: z.string().optional(),
  languages: z.string().optional(),
  specializations: z.string().optional(),
  insurances: z.string().optional(),
  avatar: z.string().optional().transform(value => value?.trim() ?? ''),
  image: z.string().optional().transform(value => value?.trim() ?? ''),
});

export type DoctorProfileFormValues = z.infer<typeof doctorProfileSchema>;

export interface DoctorProfileFormPayload {
  name: string;
  avatar?: string;
  phone?: string;
  specialty: string;
  experience: number;
  location: string;
  address: string;
  about: string;
  education: string[];
  languages: string[];
  specializations: string[];
  insurances: string[];
  image?: string;
}

export interface DoctorProfilePanelProps {
  profile: DoctorProfileFormValues | null;
  loading: boolean;
  saving: boolean;
  onSave: (payload: DoctorProfileFormPayload) => Promise<void>;
}

const DoctorProfilePanel = ({ profile, loading, saving, onSave }: DoctorProfilePanelProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
    setValue,
  } = useForm<DoctorProfileFormValues>({
    resolver: zodResolver(doctorProfileSchema),
    defaultValues: profile ?? {
      name: '',
      email: '',
      phone: '',
      specialty: '',
      experience: '0',
      location: '',
      address: '',
      about: '',
      education: '',
      languages: '',
      specializations: '',
      insurances: '',
      avatar: '',
      image: '',
    },
  });

  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<DoctorProfileFormPayload | null>(null);

  useEffect(() => {
    if (profile) {
      reset(profile);
      setFormMessage(null);
    }
  }, [profile, reset]);

  const handleImageFile = (file: File, field: 'avatar' | 'image') => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result?.toString();
      if (result) {
        setValue(field, result, { shouldDirty: true, shouldValidate: true });
      }
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (values: DoctorProfileFormValues) => {
    const payload: DoctorProfileFormPayload = {
      name: values.name.trim(),
      avatar: values.avatar || undefined,
      phone: values.phone || undefined,
      specialty: values.specialty.trim(),
      experience: Number(values.experience),
      location: values.location.trim(),
      address: values.address.trim(),
      about: values.about.trim(),
      education: splitAndClean(values.education),
      languages: splitAndClean(values.languages),
      specializations: splitAndClean(values.specializations),
      insurances: splitAndClean(values.insurances),
      image: values.image || undefined,
    };

    setPendingPayload(payload);
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!pendingPayload) return;

    setFormMessage(null);
    try {
      await onSave(pendingPayload);
      setFormMessage({ type: 'success', text: 'Profile updated successfully.' });
      setPendingPayload(null);
      setConfirmOpen(false);
    } catch (error: any) {
      setFormMessage({
        type: 'error',
        text: error?.message || 'Failed to update profile. Please try again.',
      });
      setConfirmOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-20 w-20 rounded-full" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="glass-card rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-2">Profile &amp; Settings</h2>
        <p className="text-sm text-muted-foreground">
          We couldn&apos;t load your profile details right now. Please try refreshing the page.
        </p>
      </div>
    );
  }

  const avatarPreview = watch('avatar');
  const imagePreview = watch('image');

  return (
    <div className="glass-card rounded-xl p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Profile &amp; Settings</h2>
          <p className="text-sm text-muted-foreground">
            Keep your practice details up to date. These details appear to patients when they view your
            profile.
          </p>
        </div>
        {avatarPreview && (
          <img
            src={avatarPreview}
            alt={profile.name}
            className="h-20 w-20 rounded-full border border-border object-cover"
          />
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <TextField label="Full Name" error={errors.name?.message} {...register('name')} required />
          <TextField label="Email" readOnly {...register('email')} />
          <TextField
            label="Phone"
            placeholder="(555) 123-4567"
            error={errors.phone?.message}
            {...register('phone')}
          />
          <TextField
            label="Specialty"
            error={errors.specialty?.message}
            {...register('specialty')}
            required
          />
          <TextField
            label="Years of Experience"
            type="number"
            min={0}
            error={errors.experience?.message}
            {...register('experience')}
          />
          <TextField
            label="Practice Location"
            error={errors.location?.message}
            {...register('location')}
          />
        </div>

        <TextField
          label="Clinic Address"
          error={errors.address?.message}
          {...register('address')}
        />

        <TextareaField
          label="About"
          hint="Describe your background, specialties, and approach to patient care."
          rows={5}
          error={errors.about?.message}
          {...register('about')}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <TextareaField
            label="Education"
            hint="Separate entries with commas"
            rows={3}
            error={errors.education?.message}
            {...register('education')}
          />
          <TextField
            label="Languages"
            hint="English, Spanish"
            error={errors.languages?.message}
            {...register('languages')}
          />
          <TextField
            label="Specializations"
            hint="Cardiac Imaging, Heart Failure"
            error={errors.specializations?.message}
            {...register('specializations')}
          />
          <TextField
            label="Insurances Accepted"
            hint="Aetna, Blue Cross, Cigna"
            error={errors.insurances?.message}
            {...register('insurances')}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <TextField
              label="Profile Image URL"
              placeholder="https://..."
              error={errors.avatar?.message}
              {...register('avatar')}
            />
            <ImageUploadInput
              label="Upload Profile Image"
              onFileSelected={file => handleImageFile(file, 'avatar')}
            />
          </div>
          <div className="space-y-2">
            <TextField
              label="Cover Image URL"
              placeholder="https://..."
              error={errors.image?.message}
              {...register('image')}
            />
            <ImageUploadInput
              label="Upload Cover Image"
              onFileSelected={file => handleImageFile(file, 'image')}
            />
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Cover preview"
                className="h-24 w-full rounded-md border border-border object-cover"
              />
            )}
          </div>
        </div>

        {formMessage && (
          <p
            className={`text-sm ${
              formMessage.type === 'success' ? 'text-green-600' : 'text-destructive'
            }`}
          >
            {formMessage.text}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-primary px-4 py-2 text-sm"
            disabled={saving || (!isDirty && !formMessage)}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <span className="text-xs text-muted-foreground">
            Changes are saved instantly and visible to patients.
          </span>
        </div>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={open => {
          setConfirmOpen(open);
          if (!open) {
            setPendingPayload(null);
          }
        }}
        title="Save profile changes?"
        description="These updates will immediately change what patients see on your profile."
        confirmLabel="Confirm Save"
        confirmLoadingLabel="Saving..."
        confirmLoading={saving}
        onConfirm={handleConfirmSave}
        onCancel={() => setPendingPayload(null)}
      />
    </div>
  );
};

const splitAndClean = (value?: string) =>
  (value ?? '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <label className="space-y-1 text-sm block">
      <span className="font-medium">{label}</span>
      <input
        ref={ref}
        {...props}
        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          error ? 'border-destructive focus:ring-destructive/40' : 'border-border'
        } ${className ?? ''}`}
      />
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  ),
);
TextField.displayName = 'TextField';

interface TextareaFieldProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  hint?: string;
}

const TextareaField = React.forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  ({ label, error, hint, className, ...props }, ref) => (
    <label className="space-y-1 text-sm block">
      <span className="font-medium">{label}</span>
      <textarea
        ref={ref}
        {...props}
        className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 ${
          error ? 'border-destructive focus:ring-destructive/40' : 'border-border'
        } ${className ?? ''}`}
      />
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  ),
);
TextareaField.displayName = 'TextareaField';

const ImageUploadInput = ({
  label,
  onFileSelected,
}: {
  label: string;
  onFileSelected: (file: File) => void;
}) => (
  <label className="flex flex-col gap-2 text-sm">
    <span className="font-medium">{label}</span>
    <input
      type="file"
      accept="image/*"
      onChange={event => {
        const file = event.target.files?.[0];
        if (file) {
          onFileSelected(file);
        }
      }}
      className="text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium"
    />
  </label>
);

export default DoctorProfilePanel;

