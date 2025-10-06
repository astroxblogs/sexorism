import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy - Innvibs",
  description: "Read our privacy policy and understand how we protect your data",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Privacy Policy</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information We Collect</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We collect information you provide directly to us, such as when you create an account,
              subscribe to our newsletter, make a purchase, or contact us for support.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We use the information we collect to provide, maintain, and improve our services,
              process transactions, send you technical notices, and respond to your comments and questions.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Information Sharing</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties
              without your consent, except as described in this policy.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Us</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:contact@innvibs.com" className="text-blue-600 hover:text-blue-800">
                contact@innvibs.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}