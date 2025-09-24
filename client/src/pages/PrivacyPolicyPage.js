import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 border-b pb-4 border-gray-200 dark:border-gray-700">
            Privacy Policy
          </h1>
          
          <p className="text-lg">
            <em>Last Updated: September 23, 2025</em>
          </p>

          <h2 className="text-2xl font-semibold mt-8">1. Introduction</h2>
          <p>
            Welcome to Innvibs Blogs. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.
          </p>

          <h2 className="text-2xl font-semibold mt-8">2. Information We Collect</h2>
          <p>
            We may collect information about you in a variety of ways. The information we may collect on the Site includes:
          </p>
          <ul>
            <li>
              <strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.
            </li>
            <li>
              <strong>Derivative Data:</strong> Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.
            </li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">3. Use of Your Information</h2>
          <p>
            Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Site to:
          </p>
          <ul>
            <li>Create and manage your account.</li>
            <li>Email you regarding your account or order.</li>
            <li>Enable user-to-user communications.</li>
            <li>Fulfill and manage purchases, orders, payments, and other transactions related to the Site.</li>
            <li>Generate a personal profile about you to make future visits to the Site more personalized.</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8">4. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@innvibs.com" className="text-violet-600 dark:text-violet-400 hover:underline">privacy@innvibs.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
