
import { useAuth } from '@/context/AuthContext';

const CTASection = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center glass-card rounded-xl p-8">
          <h2 className="heading-md mb-4">Ready to Experience Better Healthcare?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of patients who have simplified their healthcare journey with our digital platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/register" className="btn-primary">
              Get Started Today
            </a>
            <a href="/doctors" className="btn-outline">
              Browse Doctors
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
