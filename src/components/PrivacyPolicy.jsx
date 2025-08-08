import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GiCow } from 'react-icons/gi';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white shadow-2xl rounded-2xl p-8 space-y-6">
        <h1 className="text-3xl font-extrabold text-center text-green-700 flex items-center justify-center gap-3">
          <GiCow size={36} className="text-green-800" />
          Privacy Policy
        </h1>
        <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
          <section>
            <h2 className="text-xl font-semibold text-gray-800">Introduction</h2>
            <p>
              Welcome to the Gaudaan Donation Platform. We are committed to protecting your personal information and ensuring compliance with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India and other applicable laws. This Privacy Policy explains how we collect, use, store, and protect your data when you use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">1. Data We Collect</h2>
            <p>We collect the following personal information when you submit a Gaudaan donation form:</p>
            <ul className="list-disc pl-5">
              <li><strong>Personal Details</strong>: Name, email address, phone number, and government ID (optional).</li>
              <li><strong>Location Information</strong>: Pickup address and geographic coordinates (latitude and longitude).</li>
              <li><strong>Animal Information</strong>: Animal registered ID, animal type, condition, and description.</li>
              <li><strong>Images</strong>: Up to five images of the animal or related documentation.</li>
              <li><strong>Consent</strong>: Explicit consent for data processing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">2. Purpose of Data Collection</h2>
            <p>We use your data for the following purposes:</p>
            <ul className="list-disc pl-5">
              <li>To process and manage your Gaudaan donation request.</li>
              <li>To coordinate pickups with volunteers and shelters.</li>
              <li>To verify your identity and ensure compliance with animal welfare regulations.</li>
              <li>To communicate with you regarding your donation status or updates.</li>
              <li>To improve our platform’s functionality and user experience.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">3. Data Storage and Security</h2>
            <p>
              Your data is stored securely in our MongoDB database, hosted on servers compliant with Indian data localization requirements. We implement industry-standard security measures, including:
            </p>
            <ul className="list-disc pl-5">
              <li>Encryption of sensitive information (e.g., government ID, email, phone).</li>
              <li>Access controls to limit data access to authorized personnel only.</li>
              <li>Regular security audits to identify and address vulnerabilities.</li>
            </ul>
            <p>
              Images uploaded are stored securely, and access is restricted to authorized volunteers and administrators.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">4. Data Sharing</h2>
            <p>
              We may share your data with:
            </p>
            <ul className="list-disc pl-5">
              <li>Volunteers assigned to your donation for pickup coordination.</li>
              <li>Shelters or organizations receiving the donated animal.</li>
              <li>Regulatory authorities, if required by law (e.g., for animal welfare compliance).</li>
            </ul>
            <p>
              We do not sell or share your data for marketing purposes without your explicit consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">5. Your Rights</h2>
            <p>
              Under the DPDP Act, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5">
              <li><strong>Right to Access</strong>: Request a copy of your data.</li>
              <li><strong>Right to Correction</strong>: Correct inaccurate or incomplete data.</li>
              <li><strong>Right to Erasure</strong>: Request deletion of your data, subject to legal obligations.</li>
              <li><strong>Right to Withdraw Consent</strong>: Withdraw consent for data processing at any time.</li>
            </ul>
            <p>
              To exercise these rights, contact us at <a href="mailto:support@gaudaan.com" className="text-green-600 hover:underline">support@gaudaan.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">6. Data Retention</h2>
            <p>
              We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy or as required by law. Typically, data related to donations is retained for 5 years to comply with animal welfare and tax regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">7. Cookies and Tracking</h2>
            <p>
              Our platform may use cookies to enhance user experience and track usage analytics. You can manage cookie preferences through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page, and the updated date will be reflected below. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-800">9. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p>
              Email: <a href="mailto:support@gaudaan.com" className="text-green-600 hover:underline">support@gaudaan.com</a><br />
              Address: xyz,.abcd.
            </p>
          </section>

          <p className="text-sm text-gray-500">
            Last updated: July 26, 2025
          </p>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="w-full py-3 bg-gray-600 text-white font-semibold rounded-xl hover:bg-gray-700 transition"
        >
          Back
        </button>
      </div>
    </div>
  );
}

export default PrivacyPolicy;