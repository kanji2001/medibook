import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle2 } from 'lucide-react';

interface PendingLocationState {
  name?: string;
  email?: string;
}

const DoctorApplicationPending = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as PendingLocationState) || {};

  const handleBackToHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="container max-w-2xl">
          <div className="glass-card rounded-2xl p-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="heading-lg">Application Submitted</h1>
            <p className="text-muted-foreground">
              {state.name ? `${state.name}, ` : ''}
              thank you for applying to join MediBook as a doctor. Our admin team is reviewing your
              profile now. You’ll receive an email at{' '}
              <span className="font-medium text-foreground">{state.email || 'your inbox'}</span> once
              your account is approved.
            </p>

            <div className="bg-muted/50 rounded-xl p-6 text-left space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                What happens next?
              </h2>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                <li>• We’ll verify your credentials and submitted details.</li>
                <li>• Approval typically takes less than one business day.</li>
                <li>• You’ll be able to sign in and manage your profile as soon as it’s approved.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button className="btn-primary px-6 py-2 text-sm" onClick={handleBackToHome}>
                Back to Home
              </button>
              <Link to="/login" className="btn-outline px-6 py-2 text-sm">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorApplicationPending;

