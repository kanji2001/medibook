import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const TermsOfService = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      description:
        'By creating an account, booking appointments, or otherwise using MediBook, you agree to abide by these terms. If you do not agree, please discontinue use of the platform.',
    },
    {
      title: '2. User Responsibilities',
      bullets: [
        'Provide accurate personal and health information when requested by providers.',
        'Use the platform only for lawful purposes and refrain from interfering with other users.',
        'Maintain the confidentiality of your login credentials and notify us of any unauthorized use.',
      ],
    },
    {
      title: '3. Platform Services',
      description:
        'MediBook connects patients with healthcare professionals and administrative tools. We do not provide medical advice directly; all clinical decisions are made by licensed practitioners.',
    },
    {
      title: '4. Appointment Policies',
      bullets: [
        'Follow each provider’s cancellation and rescheduling policy.',
        'Arrive on time for virtual or in-person visits, or update your booking as soon as possible.',
        'Report any issues with providers to our support team so we can assist you promptly.',
      ],
    },
    {
      title: '5. Limitation of Liability',
      description:
        'We strive to keep MediBook available and secure, but we cannot guarantee uninterrupted access. MediBook is not liable for indirect or consequential damages arising from the use of our platform.',
    },
    {
      title: '6. Updates to These Terms',
      description:
        'We may update these terms to reflect changes in our services or legal requirements. When we do, we will post the revision date and notify users when appropriate. Continued use of the platform constitutes acceptance of the updated terms.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary/10 to-cyan-400/10 py-24">
          <div className="container max-w-4xl">
            <h1 className="heading-lg mb-4">Terms of Service</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              These terms outline the rules for using MediBook. Please review them carefully to understand your rights
              and responsibilities as a member of our healthcare community.
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

            <article className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
              <h2 className="text-2xl font-semibold mb-4">Questions?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reach our support team at{' '}
                <a href="mailto:support@medibook.com" className="text-primary hover:underline">
                  support@medibook.com
                </a>{' '}
                if you have questions about these terms.
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default TermsOfService;

