
import ServiceCard from './ServiceCard';
import { servicesData } from './ServicesData';

const ServicesGrid = () => {
  return (
    <section className="py-16">
      <div className="container">
        <h2 className="heading-md text-center mb-12">How We Can Help</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesData.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
