import { z } from 'zod';

export interface DoctorPayload {
  name: string;
  email: string;
  password: string;
  specialty: string;
  experience: number;
  phone: string;
  location: string;
  address: string;
  about: string;
  education: string[];
  languages: string[];
  specializations: string[];
  insurances: string[];
  image?: string;
  featured?: boolean;
}

export const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
export const phoneRegex = /^\d{7,15}$/;

export const doctorSchema = z.object({
  name: z.string().trim().min(2, 'Name is required'),
  email: z.string().trim().regex(emailRegex, 'Please enter a valid email address'),
  password: z.string().min(6, 'Temporary password must be at least 6 characters'),
  specialty: z.string().trim().min(2, 'Specialty is required'),
  experience: z.coerce
    .number({ invalid_type_error: 'Experience must be a number' })
    .int('Experience must be an integer')
    .nonnegative('Experience cannot be negative'),
  phone: z.string().regex(phoneRegex, 'Phone number must contain 7-15 digits'),
  location: z.string().trim().min(2, 'Location is required'),
  address: z.string().trim().min(2, 'Clinic address is required'),
  about: z.string().trim().min(10, 'Professional bio should be at least 10 characters'),
  education: z.string().optional(),
  languages: z.string().optional(),
  specializations: z.string().optional(),
  insurances: z.string().optional(),
  image: z
    .string()
    .trim()
    .optional()
    .refine(value => !value || /^https?:\/\/.+/i.test(value), {
      message: 'Please enter a valid image URL (starting with http)',
    }),
  featured: z.boolean().default(false),
});

export type DoctorFormValues = z.infer<typeof doctorSchema>;

export const toArray = (value?: string) =>
  (value || '')
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);

