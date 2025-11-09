
import { ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ServiceItem as ServiceDetailItem } from './ServicesData';

interface ServiceCardProps {
  service: ServiceDetailItem;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleService = () => {
    setIsExpanded(!isExpanded);
  };

  const Icon = service.icon;
  
  return (
    <div 
      id={service.slug}
      className={`glass-card rounded-xl transition-all duration-300 ${
        isExpanded ? 'ring-2 ring-primary transform scale-[1.02]' : ''
      }`}
    >
      <div className="p-6">
        <div className="bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
          <Icon className="w-7 h-7" />
        </div>
        
        <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
        <p className="text-muted-foreground mb-4">{service.shortDescription}</p>
        
        <button 
          className="flex items-center text-primary hover:underline focus:outline-none"
          onClick={toggleService}
        >
          {isExpanded ? (
            <>
              <span>Show Less</span>
              <ChevronUp className="ml-1 w-4 h-4" />
            </>
          ) : (
            <>
              <span>Learn More</span>
              <ChevronDown className="ml-1 w-4 h-4" />
            </>
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-4 border-t pt-4 animate-fade-in">
            <p className="text-foreground mb-4">{service.longDescription}</p>
            
            <h4 className="font-medium mb-2">Benefits:</h4>
            <ul className="space-y-2">
              {service.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <Check className="w-4 h-4 text-green-500 mt-1 mr-2 shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>

            <Link
              to={`/services/${service.slug}`}
              className="inline-flex items-center mt-6 text-sm font-medium text-primary hover:underline"
            >
              View full service details
              <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;
