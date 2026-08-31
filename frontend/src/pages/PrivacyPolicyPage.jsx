import React from 'react';
import Navbar from '../components/common/Navbar';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl pt-24">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Introduction</h2>
            <p className="text-gray-600 mb-4">
              Welcome to EcoSankalan. We are committed to protecting your personal information and your right to privacy. 
              This Privacy Policy applies to all information collected through our application.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect personal information that you voluntarily provide to us when you register on the App.
              This may include:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>Names, email addresses, and contact information.</li>
              <li>Authentication data (such as Google Login information).</li>
              <li>Location data (to provide mapping features for waste tracking).</li>
              <li>Images uploaded for waste logging or profile pictures.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use personal information collected via our App for a variety of business purposes described below:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
              <li>To facilitate account creation and logon process.</li>
              <li>To post community updates and track eco-friendly progress.</li>
              <li>To calculate and award points/vouchers for sustainable actions.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Data Security</h2>
            <p className="text-gray-600 mb-4">
              We have implemented appropriate technical and organizational security measures designed to protect the security 
              of any personal information we process. Your data is encrypted in transit and securely stored.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">5. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have questions or comments about this notice, you may email us at ecosankalan@gmail.com.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
