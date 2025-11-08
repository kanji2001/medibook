
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ChatBot from '@/components/ui/ChatBot';
import HeroSection from '@/components/services/HeroSection';
import ServicesGrid from '@/components/services/ServicesGrid';
import WhyChooseUsSection from '@/components/services/WhyChooseUsSection';
import CTASection from '@/components/services/CTASection';

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Services Grid */}
        <ServicesGrid />
        
        {/* Why Choose Us Section */}
        <WhyChooseUsSection />
        
        {/* CTA Section */}
        <CTASection />
      </main>
      
      <ChatBot />
      <Footer />
    </div>
  );
};

export default Services;
