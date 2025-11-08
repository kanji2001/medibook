
import { Clock, ShieldCheck, Users } from 'lucide-react';
import FeatureItem from './FeatureItem';

const WhyChooseUsSection = () => {
  const features = [
    {
      icon: Clock,
      title: "Time-Saving Solutions",
      description: "Our digital platform eliminates unnecessary waiting and paperwork, allowing you to focus on your health rather than administrative tasks."
    },
    {
      icon: ShieldCheck,
      title: "Safety & Privacy",
      description: "We implement the highest standards of data security and privacy protection, ensuring your medical information remains confidential."
    },
    {
      icon: Users,
      title: "Quality Healthcare Professionals",
      description: "All doctors on our platform are verified specialists with proven track records, ensuring you receive the highest quality care."
    }
  ];

  return (
    <section className="py-16 bg-secondary/30">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="heading-md mb-6">Why Choose Our Services?</h2>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <FeatureItem 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
          
          <div className="order-1 lg:order-2 relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-blue-400/20 rounded-2xl blur-3xl opacity-70"></div>
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1770&q=80" 
              alt="Healthcare professionals" 
              className="relative rounded-xl w-full h-auto object-cover shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
