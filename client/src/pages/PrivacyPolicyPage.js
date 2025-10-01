import React from 'react';

const PrivacyPolicyPage = () => {
  const sections = [
    {
      icon: '📋',
      title: 'Introduction',
      content: 'At Innvibs.com, we value your privacy and are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the site.'
    },
    {
      icon: '📊',
      title: 'Information We Collect',
      content: 'We may collect information about you in a variety of ways. The information we may collect on the Site includes:',
      list: [
        {
          title: 'Personal Data',
          desc: 'Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Site or when you choose to participate in various activities related to the Site, such as online chat and message boards.'
        },
        {
          title: 'Derivative Data',
          desc: 'Information our servers automatically collect when you access the Site, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the Site.'
        }
      ]
    },
    {
      icon: '⚙️',
      title: 'How We Use Your Information',
      content: 'The information we collect is used to:',
      bullets: [
        'Personalize your experience',
        'Create and manage your account',
        'Improve our website',
        'Respond to your inquiries',
        'Send periodic emails (if you opt-in)'
      ]
    },
    {
      icon: '🔗',
      title: 'Third-Party Services',
      content: 'We may use third-party services like Google Analytics to analyze website traffic. These services may collect information about your use of our site.'
    },
    {
      icon: '🍪',
      title: 'Cookies',
      content: 'We use cookies to enhance user experience. You can choose to disable cookies through your browser settings.'
    },
    {
      icon: '🔒',
      title: 'Data Security',
      content: 'We implement a variety of security measures to maintain the safety of your personal information.'
    },
    {
      icon: '✅',
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us at contact@astroxsoftech.com.'
    },
    {
      icon: '🔄',
      title: 'Changes to This Privacy Policy',
      content: 'We reserve the right to update this Privacy Policy. Any changes will be posted on this page with an updated effective date.'
    }
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 dark:from-purple-800 dark:via-violet-800 dark:to-blue-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">
              Privacy Policy
            </h1>
            <div className="inline-flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-white">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Effective Date: September 23, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div 
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6 sm:p-8">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl p-3 text-3xl">
                      {section.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {section.content}
                    </p>

                    {section.list && (
                      <div className="space-y-4 mt-6">
                        {section.list.map((item, idx) => (
                          <div 
                            key={idx}
                            className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-5 border-l-4 border-purple-500 dark:border-purple-400"
                          >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                              {item.title}
                            </h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.bullets && (
                      <ul className="space-y-3 mt-4">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-700 dark:text-gray-300">{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-700 dark:to-violet-700 rounded-2xl p-8 text-center shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4">
            Questions About Our Privacy Policy?
          </h3>
          <p className="text-white/90 mb-6">
            If you have any questions or concerns, we're here to help.
          </p>
          <a 
            href="mailto:contact@astroxsoftech.com"
            className="inline-flex items-center bg-white text-purple-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </a>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By using Innvibs.com, you consent to our Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;