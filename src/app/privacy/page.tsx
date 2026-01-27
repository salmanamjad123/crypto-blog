import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: January 27, 2026</p>

        <div className="prose prose-lg max-w-none">
        {/* Introduction */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p className="text-gray-300 mb-4">
            Welcome to our Crypto Analysis Platform. We respect your privacy and are committed to protecting 
            your personal data. This privacy policy explains how we handle your information when you use our 
            cryptocurrency price prediction and analysis services.
          </p>
        </section>

        {/* Information We Collect */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-200 mb-3">2.1 Information You Provide</h3>
          <p className="text-gray-300 mb-4">
            Currently, our platform does not require user registration or collect personal information directly 
            from users. You can use our prediction and analysis tools anonymously.
          </p>

          <h3 className="text-xl font-semibold text-gray-200 mb-3">2.2 Automatically Collected Information</h3>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">
              <strong>Usage Data:</strong> We may collect information about how you interact with our platform, 
              including pages visited, features used, and time spent on the site.
            </li>
            <li className="mb-2">
              <strong>Device Information:</strong> We may collect information about your device, browser type, 
              IP address, and operating system.
            </li>
            <li className="mb-2">
              <strong>Cookies:</strong> We use browser storage (localStorage) to cache data and improve 
              performance. No personal information is stored in cookies.
            </li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">3. How We Use Your Information</h2>
          <p className="text-gray-300 mb-4">We use the collected information for:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">Providing and improving our cryptocurrency analysis services</li>
            <li className="mb-2">Optimizing platform performance and user experience</li>
            <li className="mb-2">Analyzing usage patterns to enhance features</li>
            <li className="mb-2">Maintaining platform security and preventing abuse</li>
            <li className="mb-2">Complying with legal obligations</li>
          </ul>
        </section>

        {/* Third-Party Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Services</h2>
          <p className="text-gray-300 mb-4">
            Our platform integrates with the following third-party services:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">
              <strong>CoinGecko API:</strong> We use CoinGecko to fetch cryptocurrency price data and market 
              information. Please refer to CoinGecko's privacy policy for their data practices.
            </li>
            <li className="mb-2">
              <strong>Alternative.me:</strong> We use the Fear & Greed Index API for market sentiment data. 
              Please refer to Alternative.me's privacy policy.
            </li>
            <li className="mb-2">
              <strong>Binance WebSocket:</strong> We use Binance's public WebSocket API for real-time price 
              updates. No personal data is sent to Binance.
            </li>
            <li className="mb-2">
              <strong>Cloudinary:</strong> We use Cloudinary for image storage and delivery for blog content. 
              Please refer to Cloudinary's privacy policy.
            </li>
            <li className="mb-2">
              <strong>Firebase:</strong> We use Firebase Firestore for storing blog and news content. 
              Please refer to Google's Firebase privacy policy.
            </li>
          </ul>
        </section>

        {/* Data Storage and Security */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">5. Data Storage and Security</h2>
          <p className="text-gray-300 mb-4">
            We implement appropriate technical and organizational measures to protect your data:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">Data is transmitted over secure HTTPS connections</li>
            <li className="mb-2">We use server-side caching to minimize external API calls</li>
            <li className="mb-2">No sensitive personal information is collected or stored</li>
            <li className="mb-2">We regularly update our security practices</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">6. Your Rights</h2>
          <p className="text-gray-300 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">Access any personal data we hold about you</li>
            <li className="mb-2">Request correction of inaccurate data</li>
            <li className="mb-2">Request deletion of your data</li>
            <li className="mb-2">Object to data processing</li>
            <li className="mb-2">Clear your browser's localStorage at any time</li>
          </ul>
        </section>

        {/* Children's Privacy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">7. Children's Privacy</h2>
          <p className="text-gray-300 mb-4">
            Our platform is not intended for users under the age of 18. We do not knowingly collect 
            information from children. If you believe we have collected information from a child, 
            please contact us immediately.
          </p>
        </section>

        {/* International Users */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">8. International Users</h2>
          <p className="text-gray-300 mb-4">
            Our platform is accessible globally. If you access our services from outside your country, 
            your data may be transferred to and processed in countries with different data protection 
            laws. By using our platform, you consent to such transfers.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">9. Changes to This Privacy Policy</h2>
          <p className="text-gray-300 mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by 
            posting the new privacy policy on this page and updating the "Last Updated" date. We encourage 
            you to review this privacy policy periodically.
          </p>
        </section>

        {/* Contact Us */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">10. Contact Us</h2>
          <p className="text-gray-300 mb-4">
            If you have any questions about this privacy policy or our data practices, please contact us.
          </p>
        </section>

        {/* Disclaimer */}
        <section className="mb-8 p-6 bg-yellow-900 bg-opacity-20 rounded-lg border border-yellow-700">
          <h2 className="text-xl font-bold text-yellow-200 mb-3">Important Notice</h2>
          <p className="text-yellow-100">
            This platform provides cryptocurrency analysis and predictions for informational purposes. 
            We do not collect financial information, provide investment advice, or facilitate transactions. 
            Any investment decisions you make are entirely your own responsibility.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
