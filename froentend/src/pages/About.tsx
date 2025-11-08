
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle, HeartPulse, Shield, Star, Users } from 'lucide-react';

const About = () => {
  const values = [
    {
      icon: <HeartPulse className="w-8 h-8" />,
      title: "Patient-Centered Care",
      description: "We prioritize patient needs, preferences, and wellbeing in every aspect of our service.",
      color: "from-blue-500/20 to-blue-400/10",
      iconBg: "bg-blue-100 text-blue-500"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Trust & Safety",
      description: "We maintain the highest standards of privacy, security, and ethical practices.",
      color: "from-primary/20 to-cyan-400/10",
      iconBg: "bg-primary/10 text-primary"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Excellence",
      description: "We strive for excellence in every interaction, technology, and medical service we provide.",
      color: "from-yellow-500/20 to-yellow-400/10",
      iconBg: "bg-yellow-100 text-yellow-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Accessibility",
      description: "We believe quality healthcare should be accessible to everyone, everywhere.",
      color: "from-green-500/20 to-green-400/10",
      iconBg: "bg-green-100 text-green-500"
    }
  ];

  const team = [
    {
      name: "Dr. Sarah Johnson",
      role: "Chief Medical Officer",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    },
    {
      name: "James Wilson",
      role: "CEO & Founder",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Technology",
      image: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2487&q=80",
    },
    {
      name: "Michael Chen",
      role: "Chief Operations Officer",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero */}
        <section className="bg-gradient-to-r from-primary/10 to-blue-400/10 py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="heading-lg mb-6">About MediBook</h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                We're on a mission to make quality healthcare accessible to everyone through innovative technology and a patient-centered approach.
              </p>
            </div>
          </div>
        </section>
        
        {/* Our Story */}
        <section className="py-20">
          <div className="container">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="lg:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
                  alt="Medical professionals" 
                  className="rounded-3xl shadow-xl"
                />
              </div>
              <div className="lg:w-1/2">
                <h2 className="heading-lg mb-6">Our Story</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  MediBook was founded in 2020 with a simple yet powerful vision: to transform how people access and experience healthcare. What began as a telemedicine platform during the global pandemic has evolved into a comprehensive healthcare ecosystem connecting patients with the right doctors at the right time.
                </p>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Our journey started when our founder, James Wilson, experienced firsthand the challenges of finding and booking appointments with specialists. This frustration inspired the creation of a platform that simplifies the healthcare journey for everyone involved.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Today, MediBook serves thousands of patients and healthcare providers across the country, continuously innovating to improve healthcare access, quality, and experience.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 bg-secondary/30">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-lg mb-4">Our Values</h2>
              <p className="text-muted-foreground">
                These core principles guide everything we do at MediBook, from product development to customer service.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div 
                  key={index}
                  className={`relative rounded-2xl p-6 bg-gradient-to-br ${value.color} border border-white/20 shadow-sm hover:shadow-md transition-shadow animate-fade-in`}
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="absolute -top-5 left-6">
                    <div className={`rounded-xl w-10 h-10 flex items-center justify-center ${value.iconBg} shadow-sm`}>
                      {value.icon}
                    </div>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Our Team */}
        <section className="py-20">
          <div className="container">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-lg mb-4">Our Leadership Team</h2>
              <p className="text-muted-foreground">
                Meet the dedicated individuals who lead our mission to transform healthcare.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <div 
                  key={index}
                  className="glass-card rounded-xl p-6 text-center animate-fade-in"
                  style={{ animationDelay: `${index * 0.2}s` }}
                >
                  <div className="w-32 h-32 rounded-full overflow-hidden mx-auto mb-4">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Stats */}
        <section className="py-20 bg-gradient-to-r from-primary/10 to-blue-400/10">
          <div className="container">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10,000+</div>
                <p className="text-lg font-medium">Appointments Booked</p>
              </div>
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">500+</div>
                <p className="text-lg font-medium">Verified Doctors</p>
              </div>
              <div className="glass-card rounded-xl p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">98%</div>
                <p className="text-lg font-medium">Patient Satisfaction</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-20">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center glass-card rounded-2xl p-12">
              <h2 className="heading-lg mb-4">Join Our Healthcare Revolution</h2>
              <p className="text-muted-foreground mb-8">
                Whether you're a patient seeking quality care or a healthcare provider looking to grow your practice, MediBook is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/doctors" className="btn-primary">
                  Find a Doctor
                </a>
                <a href="/register" className="btn-outline">
                  Join as a Doctor
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
