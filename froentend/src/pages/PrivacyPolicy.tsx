import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const PrivacyPolicy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'Personal details that help us verify your identity, such as your name, date of birth, and contact information.',
        'Health information you choose to share when booking appointments or messaging healthcare providers.',
        'Usage data, including device information, browser type, and interactions with our platform, that helps us improve performance.',
      ],
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To help you find, book, and manage appointments with healthcare professionals.',
        'To send important service updates, appointment reminders, and confirmations.',
        'To improve our platform through analytics, troubleshooting, and product development.',
        'To comply with legal obligations and maintain the security of the MediBook platform.',
      ],
    },
    {
      title: 'How We Protect Your Data',
      content: [
        'We use industry-standard encryption to safeguard data in transit and at rest.',
        'Access to personal health information is restricted to authorized team members and providers.',
        'We regularly review our security practices and update them to address emerging threats.',
      ],
    },
    {
      title: 'Your Privacy Choices',
      content: [
        'Update your profile, communication preferences, and consent settings at any time from your account dashboard.',
        'Request access to or deletion of your data by contacting our privacy team at privacy@medibook.com.',
        'Opt out of marketing messages by using the unsubscribe link included in every email.',
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        <section className="bg-gradient-to-r from-primary/10 to-blue-400/10 py-24">
          <div className="container max-w-4xl">
            <h1 className="heading-lg mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              At MediBook, we are committed to protecting your personal and health information. This policy explains
              what data we collect, how we use it, and the choices you have about your information.
            </p>
          </div>
        </section>

        <section className="py-20">
          <div className="container max-w-4xl space-y-12">
            {sections.map((section) => (
              <article key={section.title} className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
                <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
                <ul className="space-y-3 text-muted-foreground leading-relaxed">
                  {section.content.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </article>
            ))}

            <article className="glass-card rounded-2xl p-8 shadow-sm border border-border/40">
              <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about this policy or how we handle your data, please email us at{' '}
                <a
                  href="mailto:privacy@medibook.com"
                  className="text-primary hover:underline"
                >
                  privacy@medibook.com
                </a>
                .
              </p>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;

