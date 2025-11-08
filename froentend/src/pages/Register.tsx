import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Mail, Lock, User, UserPlus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

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
  role: z.enum(['patient', 'doctor'])
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  }
);

type RegisterFormValues = z.infer<typeof registerSchema>;

const Register = () => {
  const { register: registerUser, loading } = useAuth();
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
      role: 'patient'
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (errors.confirmPassword?.type === 'custom') {
      toast({
        title: 'Validation error',
        description: errors.confirmPassword.message,
        variant: 'destructive'
      });
    }
  }, [errors.confirmPassword, toast]);

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors('root');
    try {
      await registerUser(values.name, values.email, values.password, values.role as UserRole);

      toast({
        title: 'Registration successful',
        description: 'You can now log in with your new account.'
      });

      reset({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: values.role
      });

      setTimeout(() => navigate('/login'), 800);
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

              {errors.root && (
                <div className="text-red-500 text-sm">{errors.root.message}</div>
              )}

              <button
                type="submit"
                disabled={loading || isSubmitting}
                className="btn-primary w-full h-12 flex items-center justify-center"
              >
                {loading || isSubmitting ? (
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
