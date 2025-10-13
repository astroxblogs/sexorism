'use client'
// app/privacy/page.tsx
import React, { useCallback } from 'react';

const linkCls =
  'text-purple-600 dark:text-purple-400 underline underline-offset-2 hover:opacity-90';

export default function PrivacyPage() {
  // Minimal “Manage Cookies”: clear consent cookie so your banner re-appears on next load
  const manageCookies = useCallback(() => {
    try {
      document.cookie = 'innvibs_consent=; Max-Age=0; Path=/; SameSite=Lax';
    } catch {}
    // Reload so Providers shows the consent banner again
    window.location.reload();
  }, []);

  const sections = [
    {
      icon: '📋',
      title: 'Introduction',
      content: (
        <>
          At Innvibs.com, we value your privacy and are committed to protecting it. This Privacy
          Policy explains how we collect, use, disclose, and safeguard your information when you
          visit our website. If you do not agree with the terms of this policy, please do not
          access the site.
        </>
      ),
    },
    {
      icon: '📊',
      title: 'Information We Collect',
      content: (
        <>We may collect information about you in a variety of ways. The information we may collect on the Site includes:</>
      ),
      list: [
        {
          title: 'Personal Data',
          desc:
            'Name, email address, and optional details you provide (e.g., profile info) when you register, subscribe, comment, or contact us.',
        },
        {
          title: 'Derivative/Usage Data',
          desc:
            'Device information, IP address, browser type, operating system, pages viewed, referring/exit pages, and timestamps generated automatically when you use the Site.',
        },
      ],
    },
    {
      icon: '🍪',
      title: 'Cookies & Similar Technologies',
      content: (
        <>
          We use cookies and similar technologies to operate and improve the Site. Where required
          by law, we obtain your consent before setting non-essential cookies.
        </>
      ),
      bullets: [
        'Essential: required for core functionality (security, preferences).',
        'Analytics/Measurement: understanding usage to improve content and performance.',
        'Advertising: delivering ads and measuring their effectiveness (including non-personalized where applicable).',
      ],
    },

    // ✅ REQUIRED: Explicit AdSense/Google disclosure
    {
      icon: '🪧',
      title: 'Advertising Disclosure (Google AdSense)',
      content: (
        <>
          We display advertisements served by <strong>Google AdSense</strong>. Our publisher ID is{' '}
          <code className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700">pub-XXXXXXXXXXXXXXXX</code>
          {' '}(replace with your actual ID). Depending on your consent and local law, Google may use
          cookies or device identifiers to deliver and measure ads and to personalize content. You
          can control your preferences via the cookie banner and the opt-out links below.
        </>
      ),
      list: [
        {
          title: 'Google Publisher Policies',
          desc: (
            <>
              See policies for publishers:{' '}
              <a
                className={linkCls}
                href="https://support.google.com/adspolicy/answer/6008942"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://support.google.com/adspolicy/answer/6008942
              </a>
            </>
          ),
        },
        {
          title: 'AdSense Program Policies',
          desc: (
            <>
              Learn about AdSense policies:{' '}
              <a
                className={linkCls}
                href="https://support.google.com/adsense/answer/48182"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://support.google.com/adsense/answer/48182
              </a>
            </>
          ),
        },
      ],
    },

    // ✅ REQUIRED: Third-party disclosure with clickable links
    {
      icon: '🔗',
      title: 'Third-Party Services & Disclosures (Google)',
      content: (
        <>
          We use third-party services provided by Google and its partners for analytics and
          advertising. These partners may set cookies and/or use device identifiers to deliver,
          measure, and improve services.
        </>
      ),
      list: [
        {
          title: 'Google Analytics',
          desc: (
            <>
              Used for audience measurement and site performance insights. Learn more:{' '}
              <a
                className={linkCls}
                href="https://policies.google.com/technologies/partner-sites"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://policies.google.com/technologies/partner-sites
              </a>
            </>
          ),
        },
        {
          title: 'Google AdSense / Ads',
          desc: (
            <>
              We may show ads served by Google. Manage ad personalization in your Google account:{' '}
              <a
                className={linkCls}
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://adssettings.google.com
              </a>
            </>
          ),
        },
        {
          title: 'Ad Technology Providers',
          desc: (
            <>
              See Google’s list of ad technology providers:{' '}
              <a
                className={linkCls}
                href="https://support.google.com/admanager/answer/9012903"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://support.google.com/admanager/answer/9012903
              </a>
            </>
          ),
        },
      ],
    },

    // ✅ REQUIRED: clear user opt-out information with industry links
    {
      icon: '🧭',
      title: 'Your Choices & Opt-Out',
      content: (
        <>
          You can manage non-essential cookies via our banner (or the button below). You can also
          opt out of interest-based advertising using the industry tools here:
        </>
      ),
      list: [
        {
          title: 'Google Ads Settings',
          desc: (
            <>
              <a
                className={linkCls}
                href="https://adssettings.google.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://adssettings.google.com
              </a>
            </>
          ),
        },
        {
          title: 'AboutAds (US DAA)',
          desc: (
            <>
              <a
                className={linkCls}
                href="https://optout.aboutads.info"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://optout.aboutads.info
              </a>
            </>
          ),
        },
        {
          title: 'NAI Consumer Opt-Out',
          desc: (
            <>
              <a
                className={linkCls}
                href="https://optout.networkadvertising.org"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://optout.networkadvertising.org
              </a>
            </>
          ),
        },
      ],
      bullets: [
        'If you reject in the banner, we do not load non-essential analytics/ads scripts.',
        'Where available, we may show non-personalized ads instead of personalized ads.',
        'You can also control cookies via your browser settings.',
      ],
    },

    {
      icon: '⚙️',
      title: 'How We Use Your Information',
      content: 'We use information to:',
      bullets: [
        'Personalize your experience and content.',
        'Operate, maintain, and improve the Site.',
        'Respond to your inquiries and provide support.',
        'Send optional updates (only if you opt in).',
        'Support analytics and/or advertising based on your consent choices.',
      ],
    },
    {
      icon: '🔒',
      title: 'Data Security',
      content:
        'We implement reasonable technical and organizational measures to help protect your personal information. However, no method of transmission or storage is 100% secure.',
    },
    {
      icon: '✅',
      title: 'Your Rights',
      content:
        'Subject to applicable law, you may have rights to access, correct, or delete your personal information. To exercise these rights, contact us at contact@astroxsoftech.com.',
    },
    {
      icon: '🔄',
      title: 'Changes to This Privacy Policy',
      content:
        'We may update this Privacy Policy from time to time. Changes will be posted here with an updated effective date.',
    },
  ];

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-blue-600 dark:from-purple-800 dark:via-violet-800 dark:to-blue-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-block mb-4">
              <div className="bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full p-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4">Privacy Policy</h1>
            <div className="inline-flex items-center bg-white/20 dark:bg-white/10 backdrop-blur-sm rounded-full px-6 py-2 text-white">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
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
                    <div className="bg-gradient-to-br from-purple-100 to-violet-100 dark:from-purple-900/30 dark:to-violet-900/30 rounded-xl p-3 text-3xl">
                      {section.icon}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                      {section.title}
                    </h2>

                    {/* main paragraph */}
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                      {section.content}
                    </p>

                    {/* optional list of items */}
                    {'list' in section && (section as any).list && (
                      <div className="space-y-4 mt-6">
                        {(section as any).list.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-5 border-l-4 border-purple-500 dark:border-purple-400"
                          >
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                              {item.desc}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* optional bullet list */}
                    {'bullets' in section && (section as any).bullets && (
                      <ul className="space-y-3 mt-4">
                        {(section as any).bullets.map((bullet: any, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <svg
                              className="w-6 h-6 text-purple-600 dark:text-purple-400 mr-3 flex-shrink-0 mt-0.5"
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

        {/* Manage Cookies / Contact */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">Manage Cookies</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-5">
              Update your consent choices at any time. Clicking the button below will reopen the cookie banner.
            </p>
            <button
              onClick={manageCookies}
              className="inline-flex items-center bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold px-6 py-2.5 rounded-full hover:opacity-95 transition shadow-lg"
            >
              Open Cookie Preferences
            </button>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-violet-600 dark:from-purple-700 dark:to-violet-700 rounded-2xl p-8 text-center shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-3">Questions About Our Privacy Policy?</h3>
            <p className="text-white/90 mb-5">
              If you have any questions or concerns, we&apos;re here to help.
            </p>
            <a
              href="mailto:contact@astroxsoftech.com"
              className="inline-flex items-center bg-white text-purple-600 font-semibold px-8 py-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
              Contact Us
            </a>
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            By using Innvibs.com, you consent to our Privacy Policy and agree to its terms.
          </p>
        </div>
      </div>
    </div>
  );
}
