
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Calendar } from 'lucide-react';

const Footer = () => {
  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'Find Doctors', to: '/doctors' },
    { label: 'Book Appointment', to: '/appointment' },
    { label: 'Services', to: '/services' },
    { label: 'About Us', to: '/about' },
  ];

  const serviceLinks = [
    { label: 'General Consultation', to: '/services/general-consultation' },
    { label: 'Specialist Appointments', to: '/services/specialist-appointments' },
    { label: 'Medical Check-ups', to: '/services/medical-checkups' },
    { label: 'Online Consultations', to: '/services/online-consultations' },
    { label: 'Emergency Care', to: '/services/emergency-care' },
  ];

  const policyLinks = [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Service', to: '/terms-of-service' },
    { label: 'Cookie Policy', to: '/cookie-policy' },
  ];

  const socialLinks = [
    {
      label: 'Visit MediBook on Facebook',
      href: 'https://www.facebook.com/medibookcare',
      Icon: Facebook,
    },
    {
      label: 'Follow MediBook on X',
      href: 'https://x.com/medibookcare',
      Icon: Twitter,
    },
    {
      label: 'Follow MediBook on Instagram',
      href: 'https://www.instagram.com/medibookcare',
      Icon: Instagram,
    },
  ];

  return (
    <footer className="bg-white border-t border-border">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link 
              to="/" 
              className="text-xl font-bold text-primary flex items-center space-x-2"
            >
              <span className="bg-primary text-white rounded-full p-1.5">
                <Calendar className="w-5 h-5" />
              </span>
              <span>MediBook</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              Simplifying healthcare access with easy online appointment booking, connecting you with top specialists for quality care.
            </p>
            <div className="flex space-x-4 pt-2">
              {socialLinks.map(({ label, href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2">
              {serviceLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link to={to} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=123+Healthcare+Blvd%2C+Medical+District%2C+City%2C+10001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  123 Healthcare Blvd, Medical District, City, 10001
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <a href="tel:+1234567890" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  (123) 456-7890
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <a href="mailto:info@medibook.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  info@medibook.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} MediBook. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              {policyLinks.map(({ label, to }) => (
                <Link key={label} to={to} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
