import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const CookiePolicy = () => {
  const sections = [
    {
      title: 'What Are Cookies?',
      description:
        'Cookies are small text files stored on your device that help us remember your preferences, keep you logged in, and understand how you use MediBook. They do not give us access to your device or personal files.',
    },
    {
      title: 'Types of Cookies We Use',
      bullets: [
        'Essential cookies keep the platform secure and let you sign in to your account.',
        'Performance cookies, such as analytics, help us understand how visitors navigate MediBook so we can improve the experience.',
        'Functional cookies remember your preferences, like selected language or saved providers.',
        'Marketing cookies help us deliver relevant information about services you may find useful. We currently use limited marketing cookies.',
      ],
    },
    {
      title: 'Managing Your Cookie Preferences',
      bullets: [
        'You can adjust cookie settings in your browser at any time. Blocking essential cookies may affect core functionality.',
        'Use the banner on your first visit to opt in or out of non-essential cookies.',
        'Contact us at privacy@medibook.com if you have questions about how we use cookies or similar technologies.',
      ],
    },
    {
      title: 'Updates to This Policy',
      description:
        'We review this policy regularly to reflect changes in technology or regulations. We will update the effective date and notify users of significant changes.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary/10 to-purple-400/10 py-24">
          <div className="container max-w-4xl">
            <h1 className="heading-lg mb-4">Cookie Policy</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              This Cookie Policy explains how MediBook uses cookies and similar tracking technologies to provide,
              protect, and improve our services.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container max-w-4xl space-y-12">
            {sections.map((section) => (
              <article key={section.title} className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                {section.description && (
                  <p className="text-muted-foreground leading-relaxed">{section.description}</p>
                )}
                {section.bullets && (
                  <ul className="space-y-3 text-muted-foreground leading-relaxed mt-4">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>• {bullet}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CookiePolicy;

