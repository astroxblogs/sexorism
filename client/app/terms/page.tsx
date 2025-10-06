import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service - Innvibs",
  description: "Read our terms of service and user agreement",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Terms of Service</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <div className="prose dark:prose-invert max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Acceptance of Terms</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              By accessing and using Innvibs, you accept and agree to be bound by the terms
              and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Use License</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Permission is granted to temporarily download one copy of the materials on Innvibs
              for personal, non-commercial transitory viewing only.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Disclaimer</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              The materials on Innvibs are provided on an 'as is' basis. Innvibs makes no
              warranties, expressed or implied, and hereby disclaims and negates all other warranties
              including without limitation, implied warranties or conditions of merchantability.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at{' '}
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