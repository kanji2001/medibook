import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Calendar, CheckCircle, ArrowRight, X } from "lucide-react";

const HowItWorks = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate(); // React Router navigation

  const steps = [
    {
      icon: <Search className="w-8 h-8" />,
      title: "Find a Doctor",
      description: "Search for specialists based on specialty, location, or availability that matches your needs.",
      color: "from-blue-500/20 to-blue-400/10",
      iconBg: "bg-blue-100 text-blue-500",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Book an Appointment",
      description: "Select your preferred time and date from the available slots with just a few clicks.",
      color: "from-primary/20 to-cyan-400/10",
      iconBg: "bg-primary/10 text-primary",
    },
    {
      icon: <CheckCircle className="w-8 h-8" />,
      title: "Get Treatment",
      description: "Visit the doctor at the scheduled time or connect remotely for virtual consultations.",
      color: "from-green-500/20 to-green-400/10",
      iconBg: "bg-green-100 text-green-500",
    },
  ];

  return (
    <section className="py-20">
      <div className="container">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="heading-lg mb-4">How It Works</h2>
          <p className="text-muted-foreground">
            Booking an appointment with MediBook is simple, fast, and convenient. Follow these easy steps to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-6 bg-gradient-to-br ${step.color} border border-white/20 shadow-sm hover:shadow-md transition-shadow animate-fade-in`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className="absolute -top-5 left-6">
                <div className={`rounded-xl w-10 h-10 flex items-center justify-center ${step.iconBg} shadow-sm`}>
                  {step.icon}
                </div>
              </div>
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <ArrowRight className="w-5 h-5 text-muted-foreground/50" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-block glass-card rounded-2xl p-6 max-w-2xl">
            <h3 className="text-xl font-semibold mb-3">Ready to experience better healthcare?</h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of patients who have simplified their healthcare journey with MediBook.
            </p>
            <button onClick={() => setIsModalOpen(true)} className="btn-primary">
              Get Started Today
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold mb-4">Start Your Healthcare Journey</h2>
            <p className="text-muted-foreground mb-6">
              Sign up or search for a doctor to book your first appointment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                className="btn-primary w-full"
                onClick={() => navigate("/register")} // Redirects to signup page
              >
                Sign Up
              </button>
              <button className="btn-outline w-full" onClick={() => setIsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HowItWorks;
