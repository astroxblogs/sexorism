import React from 'react';

const TermsOfServicePage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
            Terms of Service
          </h1>

          <p className="text-lg">
            <em>Last Updated: September 23, 2025</em>
          </p>

          <h2 className="text-2xl font-semibold mt-8">1. Agreement to Terms</h2>
          <p>
            By using our services, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the services. We may modify the Terms at any time, in our sole discretion. If we do so, we’ll let you know either by posting the modified Terms on the Site or through other communications.
          </p>

          <h2 className="text-2xl font-semibold mt-8">2. Intellectual Property Rights</h2>
          <p>
            The Site and its original content, features, and functionality are owned by Innvibs Blogs and are protected by international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8">3. User Conduct</h2>
          <p>
            You agree not to use the Site to:
          </p>
          <ul>
            <li>Violate any local, state, national, or international law.</li>
            <li>Stalk, harass, or harm another individual.</li>
            <li>Collect or store personal data about other users without their express permission.</li>
            <li>Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">4. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8">5. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at: <a href="mailto:legal@innvibs.com" className="text-violet-600 dark:text-violet-400 hover:underline">legal@innvibs.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
