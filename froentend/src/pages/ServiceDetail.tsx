import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { servicesData } from '@/components/services/ServicesData';
import { CalendarDays, Clock, ShieldCheck, Users } from 'lucide-react';

const serviceMeta = {
  'general-consultation': {
    subtitle: 'Comprehensive primary care designed around your needs.',
    stats: [
      { label: 'Average Wait Time', value: '12 minutes', Icon: Clock },
      { label: 'Clinics Covered', value: '120+', Icon: CalendarDays },
      { label: 'Patient Satisfaction', value: '97%', Icon: ShieldCheck },
    ],
  },
  'specialist-appointments': {
    subtitle: 'Connect with top specialists across every major discipline.',
    stats: [
      { label: 'Specialties Available', value: '45+', Icon: Users },
      { label: 'Verified Specialists', value: '600+', Icon: ShieldCheck },
      { label: 'Average Booking Time', value: '3 minutes', Icon: Clock },
    ],
  },
  'medical-checkups': {
    subtitle: 'Stay proactive with personalized diagnostic programs.',
    stats: [
      { label: 'Lab Partners', value: '80+', Icon: CalendarDays },
      { label: 'Package Options', value: '18', Icon: Users },
      { label: 'Result Turnaround', value: '24 hrs', Icon: Clock },
    ],
  },
  'online-consultations': {
    subtitle: 'Secure telehealth visits available wherever you are.',
    stats: [
      { label: 'Virtual Visits Completed', value: '25k+', Icon: CalendarDays },
      { label: 'Licensed Providers', value: '350+', Icon: ShieldCheck },
      { label: 'Average Response', value: 'Under 5 min', Icon: Clock },
    ],
  },
  'emergency-care': {
    subtitle: 'Rapid support and triage for urgent health concerns.',
    stats: [
      { label: '24/7 Hotline Coverage', value: 'Nationwide', Icon: ShieldCheck },
      { label: 'Partner Hospitals', value: '65', Icon: Users },
      { label: 'Average Response', value: '4 minutes', Icon: Clock },
    ],
  },
  'preventive-care': {
    subtitle: 'Holistic programs focused on long-term wellness.',
    stats: [
      { label: 'Wellness Coaches', value: '75+', Icon: Users },
      { label: 'Customized Plans', value: 'Tailored', Icon: ShieldCheck },
      { label: 'Program Reviews', value: '4.9 / 5', Icon: CalendarDays },
    ],
  },
} as const;

const defaultMeta = {
  subtitle: 'Explore how this MediBook service supports your healthcare journey.',
  stats: [
    { label: 'Trusted Patients', value: 'Thousands', Icon: Users },
    { label: 'Provider Satisfaction', value: 'Top Rated', Icon: ShieldCheck },
    { label: 'Availability', value: '24/7', Icon: Clock },
  ],
};

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const service = useMemo(() => servicesData.find((item) => item.slug === slug), [slug]);

  const meta = (slug && serviceMeta[slug as keyof typeof serviceMeta]) || defaultMeta;

  const relatedServices = useMemo(
    () => servicesData.filter((item) => item.slug !== slug).slice(0, 3),
    [slug]
  );

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-24 bg-secondary/20">
          <div className="text-center space-y-4">
            <h1 className="heading-lg">Service Not Found</h1>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We couldn&apos;t find the service you&apos;re looking for. Explore all services to discover how MediBook
              can support your care.
            </p>
            <Link to="/services" className="btn-primary">
              Browse all services
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary/10 to-blue-400/10 py-24">
          <div className="container max-w-6xl">
            <div className="grid lg:grid-cols-[1.2fr,1fr] gap-12 items-center">
              <div>
                <span className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {service.title}
                </span>
                <h1 className="heading-lg mb-4">{service.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">{service.tagline}</p>
                <p className="text-muted-foreground leading-relaxed mb-8">{meta.subtitle}</p>
                <div className="flex flex-wrap gap-4">
                  <Link to="/appointment" className="btn-primary">
                    Book an appointment
                  </Link>
                  <Link to="/doctors" className="btn-outline">
                    Meet providers
                  </Link>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl overflow-hidden shadow-xl ring-1 ring-border/40">
                  <img
                    src={service.heroImage}
                    alt={service.title}
                    className="w-full h-72 object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {meta.stats.map(({ label, value, Icon }) => (
                    <div key={label} className="glass-card rounded-xl p-5 text-center">
                      <Icon className="w-6 h-6 text-primary mx-auto mb-2" />
                      <div className="text-2xl font-semibold">{value}</div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container max-w-6xl grid lg:grid-cols-[2fr,1fr] gap-12">
            <article className="space-y-8">
              <div className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">Overview</h2>
                <p className="text-muted-foreground leading-relaxed">{service.longDescription}</p>
              </div>

              <div className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">Key highlights</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {service.highlights.map((highlight) => (
                    <div key={highlight.title} className="rounded-xl border border-border/40 p-5 bg-background/70">
                      <h3 className="text-lg font-semibold mb-2">{highlight.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{highlight.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">What&apos;s included</h2>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  {service.benefits.map((benefit) => (
                    <li key={benefit}>• {benefit}</li>
                  ))}
                </ul>
              </div>

              <div className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">How it works</h2>
                <ol className="list-decimal list-inside space-y-3 text-muted-foreground leading-relaxed">
                  {service.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
              </div>

              <div className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">Is this service right for you?</h2>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  {service.idealFor.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </article>

            <aside className="space-y-8">
              <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/40 sticky top-32">
                <h3 className="text-xl font-semibold mb-3">Need help deciding?</h3>
                <p className="text-muted-foreground mb-4">
                  Our care coordinators can recommend the best MediBook service based on your current health goals.
                </p>
                <a href="tel:+1234567890" className="btn-outline w-full text-center">
                  Call (123) 456-7890
                </a>
              </div>

              <div className="glass-card rounded-2xl p-6 shadow-sm border border-border/40">
                <h3 className="text-xl font-semibold mb-3">Related services</h3>
                <ul className="space-y-3 text-sm">
                  {relatedServices.map((item) => (
                    <li key={item.slug}>
                      <Link to={`/services/${item.slug}`} className="text-primary hover:underline">
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>

        <section className="py-16 bg-secondary/20">
          <div className="container max-w-6xl">
            <div className="glass-card rounded-2xl p-10 shadow-sm border border-border/40">
              <h2 className="text-2xl font-semibold mb-6">Frequently asked questions</h2>
              <div className="divide-y divide-border/40">
                {service.faqs.map((faq) => (
                  <div key={faq.question} className="py-5">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetail;

