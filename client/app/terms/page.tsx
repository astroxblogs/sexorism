// app/terms/page.tsx
import React from 'react';

export default function TermsPage() {
  const sections = [
    {
      icon: '📜',
      title: 'Introduction',
      content:
        'Welcome to Sexorism.com. By accessing or using our website, you agree to comply with and be bound by the following Terms of Service. If you do not agree with these terms, please refrain from using our site.',
    },
    {
      icon: '⚖️',
      title: 'Use of the Website',
      content: 'You may use our website for lawful purposes only. You agree not to:',
      bullets: [
        'Engage in any activity that disrupts or interferes with the functioning of the website',
        'Upload or transmit harmful content, including viruses or malware',
        'Violate any applicable laws or regulations',
      ],
    },
    {
      icon: '©️',
      title: 'Intellectual Property Rights',
      content:
        'All content on Sexorism.com, including text, images, and logos, is protected by copyright and trademark laws. You may not use, reproduce, or distribute any content without our prior written permission.',
    },
    {
      icon: '👤',
      title: 'User Conduct',
      content: 'You agree not to use the Site to:',
      bullets: [
        'Violate any local, state, national, or international law',
        'Stalk, harass, or harm another individual',
        'Collect or store personal data about other users without their express permission',
        'Impersonate any person or entity, or falsely state or otherwise misrepresent your affiliation with a person or entity',
      ],
    },
    {
      icon: '✍️',
      title: 'User Contributions',
      content:
        'If you contribute content to our website, such as comments or articles, you grant Sexorism.com a non-exclusive, royalty-free license to use, modify, and display your content.',
    },
    {
      icon: '⚠️',
      title: 'Limitation of Liability',
      content:
        'Sexorism.com is not liable for any damages arising from the use or inability to use our website. This includes, but is not limited to, direct, indirect, incidental, or consequential damages.',
    },
    {
      icon: '🏛️',
      title: 'Governing Law',
      content:
        'These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.',
    },
    {
      icon: '🔄',
      title: 'Modifications',
      content:
        'We reserve the right to modify these Terms of Service at any time. Changes will be posted on this page with an updated effective date.',
    },
  ] as const;

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-800 dark:via-indigo-800 dark:to-purple-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Terms of Service</h1>
            <div className="inline-flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-white">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium">Effective Date: September 23, 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
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
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl p-3 text-3xl">
                      {section.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {section.content}
                    </p>

                    {'bullets' in section && section.bullets && (
                      <ul className="space-y-3 mt-4">
                        {section.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start">
                            <svg
                              className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
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

        {/* Notice */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 sm:p-8 border-l-4 border-amber-500 dark:border-amber-400">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <svg className="w-8 h-8 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100 mb-2">Important Notice</h3>
              <p className="text-amber-800 dark:text-amber-200 leading-relaxed">
                By continuing to use Sexorism.com, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                Your continued use of the website constitutes acceptance of any modifications to these terms.
              </p>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl p-8 text-center shadow-xl">
          <h3 className="text-2xl font-bold text-white mb-4">Questions About Our Terms?</h3>
          <p className="text-white/90 mb-6">
            If you have any questions or concerns about these Terms of Service, please don&apos;t hesitate to reach out.
          </p>
          <a
            href="mailto:contact@astroxsoftech.com"
            className="inline-flex items-center bg-white text-blue-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Contact Us
          </a>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            These Terms of Service were last updated on September 23, 2025.
          </p>
        </div>
      </div>
    </div>
  );
}
