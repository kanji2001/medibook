import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Lock, User, UserPlus, Loader2, Phone, Briefcase, MapPin, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterPayload } from '@/stores/authStore';

const phoneRegex = /^[0-9()+\-\s]{7,}$/;

const getDashboardPath = (role?: string) => {
  switch (role) {
    case 'doctor':
      return '/doctor-dashboard';
    case 'admin':
      return '/admin-dashboard';
    case 'patient':
    default:
      return '/patient-dashboard';
  }
};

const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Name must be at least 3 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[A-Za-z])(?=.*\d).+$/,
      'Password must contain at least one letter and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['patient', 'doctor']),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  experience: z.string().optional(),
  location: z.string().optional(),
  address: z.string().optional(),
  about: z.string().optional(),
  education: z.string().optional(),
  languages: z.string().optional(),
  specializations: z.string().optional(),
  insurances: z.string().optional(),
  licenseNumber: z.string().optional(),
  consultationFee: z.string().optional(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
).superRefine((data, ctx) => {
  if (data.role === 'doctor') {
    if (!data.phone || !phoneRegex.test(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['phone'],
        message: 'Enter a valid phone number',
      });
    }

    if (!data.specialty || data.specialty.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['specialty'],
        message: 'Specialty is required',
      });
    }

    const experienceValue = Number(data.experience);
    if (Number.isNaN(experienceValue) || experienceValue < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['experience'],
        message: 'Experience must be a positive number',
      });
    }

    if (!data.location || data.location.trim().length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['location'],
        message: 'Practice location is required',
      });
    }

    if (!data.address || data.address.trim().length < 5) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['address'],
        message: 'Clinic address is required',
      });
    }

    if (!data.about || data.about.trim().length < 20) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['about'],
        message: 'Tell patients about your expertise (at least 20 characters)',
      });
    }

    const ensureList = (value: string | undefined, field: keyof typeof data, label: string) => {
      if (!value || !value.trim().length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: `${label} is required`,
        });
      }
    };

    ensureList(data.education, 'education', 'Education history');
    ensureList(data.languages, 'languages', 'Languages');
    ensureList(data.specializations, 'specializations', 'Specializations');
    ensureList(data.insurances, 'insurances', 'Insurances');

    if (data.consultationFee && Number(data.consultationFee) < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['consultationFee'],
        message: 'Consultation fee must be zero or greater',
      });
    }
  }
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { user, isAuthenticated, loading: authLoading, register: registerUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    register: formRegister,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
      phone: '',
      specialty: '',
      experience: '',
      location: '',
      address: '',
      about: '',
      education: '',
      languages: '',
      specializations: '',
      insurances: '',
      licenseNumber: '',
      consultationFee: '',
    }
  });

  const selectedRole = watch('role');
  const redirectRef = useRef(false);

  useEffect(() => {
    if (errors.confirmPassword?.type === 'custom') {
      toast({
        title: 'Validation error',
        description: errors.confirmPassword.message,
        variant: 'destructive'
      });
    }
  }, [errors.confirmPassword, toast]);

  useEffect(() => {
    if (authLoading || redirectRef.current) return;
    if (isAuthenticated && user) {
      redirectRef.current = true;
      toast({
        title: 'Already signed in',
        description: 'You are already logged in.',
      });
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate, toast]);

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors('root');
    try {
      const payload: RegisterPayload = {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        role: values.role as UserRole,
      };

      if (values.role === 'doctor') {
        payload.phone = values.phone?.trim();
        payload.specialty = values.specialty?.trim();
        payload.experience = Number(values.experience);
        payload.location = values.location?.trim();
        payload.address = values.address?.trim();
        payload.about = values.about?.trim();
        const toArray = (input?: string) =>
          (input || '')
            .split(',')
            .map(item => item.trim())
            .filter(Boolean);
        payload.education = toArray(values.education);
        payload.languages = toArray(values.languages);
        payload.specializations = toArray(values.specializations);
        payload.insurances = toArray(values.insurances);
        payload.licenseNumber = values.licenseNumber?.trim();
        payload.consultationFee = values.consultationFee
          ? Number(values.consultationFee)
          : undefined;
      }

      const result = await registerUser(payload);

      if (values.role === 'doctor' && result.awaitingApproval) {
        toast({
          title: 'Application Submitted',
          description: 'Your doctor profile is pending admin approval.',
        });

        reset({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'doctor',
          phone: '',
          specialty: '',
          experience: '',
          location: '',
          address: '',
          about: '',
          education: '',
          languages: '',
          specializations: '',
          insurances: '',
          licenseNumber: '',
          consultationFee: '',
        });

        navigate('/doctor-application/pending', {
          state: {
            name: values.name.trim(),
            email: values.email.trim(),
          },
        });
        return;
      }

      redirectRef.current = true;

      toast({
        title: 'Registration successful',
        description: 'Your account is ready to use.',
      });

      reset({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: values.role,
        phone: '',
        specialty: '',
        experience: '',
        location: '',
        address: '',
        about: '',
        education: '',
        languages: '',
        specializations: '',
        insurances: '',
        licenseNumber: '',
        consultationFee: '',
      });

      navigate(getDashboardPath(values.role), { replace: true });
    } catch (err: any) {
      const errorMessage = err?.message || 'Something went wrong. Try again.';
      setError('root', { type: 'server', message: errorMessage });

      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container max-w-md">
          <div className="glass-card rounded-xl p-8">
            <div className="text-center mb-8">
              <h1 className="heading-lg mb-2">Create an Account</h1>
              <p className="text-muted-foreground">
                Join MediBook to book appointments with top doctors
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <User className="h-5 w-5" />
                  </span>
                  <input
                    id="name"
                    type="text"
                    {...formRegister('name')}
                    placeholder="Enter your full name"
                    className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    id="email"
                    type="email"
                    {...formRegister('email')}
                    placeholder="Enter your email"
                    className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="password"
                    type="password"
                    {...formRegister('password')}
                    placeholder="Create a password"
                    className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    id="confirmPassword"
                    type="password"
                    {...formRegister('confirmPassword')}
                    placeholder="Confirm your password"
                    className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setValue('role', 'patient', { shouldValidate: true })}
                    className={`flex items-center justify-center px-4 py-2 rounded-md border transition-colors ${selectedRole === 'patient'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-muted'
                      }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('role', 'doctor', { shouldValidate: true })}
                    className={`flex items-center justify-center px-4 py-2 rounded-md border transition-colors ${selectedRole === 'doctor'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background border-input hover:bg-muted'
                      }`}
                  >
                    Doctor
                  </button>
                </div>
              </div>

            {selectedRole === 'doctor' && (
              <div className="border-t border-border pt-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold">Doctor Profile Details</h2>
                  <p className="text-sm text-muted-foreground">
                    Provide the information patients will see once your profile is approved.
                  </p>
                </div>

                <div className="grid gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="phone">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Phone className="h-5 w-5" />
                        </span>
                        <input
                          id="phone"
                          type="tel"
                          {...formRegister('phone')}
                          placeholder="(555) 123-4567"
                          className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="specialty">
                        Primary Specialty
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <Briefcase className="h-5 w-5" />
                        </span>
                        <input
                          id="specialty"
                          type="text"
                          {...formRegister('specialty')}
                          placeholder="e.g. Cardiologist"
                          className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      {errors.specialty && (
                        <p className="text-sm text-destructive">{errors.specialty.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="experience">
                        Years of Experience
                      </label>
                      <input
                        id="experience"
                        type="number"
                        min={0}
                        {...formRegister('experience')}
                        placeholder="e.g. 8"
                        className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.experience && (
                        <p className="text-sm text-destructive">{errors.experience.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="consultationFee">
                        Consultation Fee (optional)
                      </label>
                      <input
                        id="consultationFee"
                        type="number"
                        min={0}
                        {...formRegister('consultationFee')}
                        placeholder="e.g. 200"
                        className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.consultationFee && (
                        <p className="text-sm text-destructive">{errors.consultationFee.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="location">
                      Practice Location
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <input
                        id="location"
                        type="text"
                        {...formRegister('location')}
                        placeholder="Hospital or clinic name"
                        className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    {errors.location && (
                      <p className="text-sm text-destructive">{errors.location.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="address">
                      Clinic Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      {...formRegister('address')}
                      placeholder="Street, city, and ZIP code"
                      className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="about">
                      Professional Summary
                    </label>
                    <textarea
                      id="about"
                      {...formRegister('about')}
                      placeholder="Describe your experience, approach, and expertise (min. 20 characters)"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[120px]"
                    />
                    {errors.about && <p className="text-sm text-destructive">{errors.about.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="education">
                        Education & Training
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                          <FileText className="h-5 w-5" />
                        </span>
                        <input
                          id="education"
                          type="text"
                          {...formRegister('education')}
                          placeholder="Comma-separated list (e.g. Harvard Medical School, Johns Hopkins)"
                          className="pl-10 w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                      </div>
                      {errors.education && (
                        <p className="text-sm text-destructive">{errors.education.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="languages">
                        Languages
                      </label>
                      <input
                        id="languages"
                        type="text"
                        {...formRegister('languages')}
                        placeholder="e.g. English, Spanish"
                        className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.languages && (
                        <p className="text-sm text-destructive">{errors.languages.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="specializations">
                        Specializations
                      </label>
                      <input
                        id="specializations"
                        type="text"
                        {...formRegister('specializations')}
                        placeholder="e.g. Preventive Cardiology, Heart Failure"
                        className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.specializations && (
                        <p className="text-sm text-destructive">{errors.specializations.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium" htmlFor="insurances">
                        Insurances Accepted
                      </label>
                      <input
                        id="insurances"
                        type="text"
                        {...formRegister('insurances')}
                        placeholder="e.g. Blue Cross, Aetna"
                        className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                      {errors.insurances && (
                        <p className="text-sm text-destructive">{errors.insurances.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="licenseNumber">
                      Medical License Number (optional)
                    </label>
                    <input
                      id="licenseNumber"
                      type="text"
                      {...formRegister('licenseNumber')}
                      placeholder="Enter your license number"
                      className="w-full h-12 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {errors.licenseNumber && (
                      <p className="text-sm text-destructive">{errors.licenseNumber.message}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

              {errors.root && (
                <div className="text-red-500 text-sm">{errors.root.message}</div>
              )}

              <button
                type="submit"
                disabled={authLoading || isSubmitting}
                className="btn-primary w-full h-12 flex items-center justify-center"
              >
                {authLoading || isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" />
                    Create Account
                  </>
                )}
              </button>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Register;
