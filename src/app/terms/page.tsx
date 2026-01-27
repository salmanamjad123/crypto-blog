import React from 'react';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-6">Terms and Conditions</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: January 27, 2026</p>

        <div className="prose prose-lg max-w-none">
        {/* Agreement to Terms */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
          <p className="text-gray-300 mb-4">
            By accessing and using this Crypto Analysis Platform ("Service," "Platform," or "Website"), 
            you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part 
            of these terms, you may not access the Service.
          </p>
        </section>

        {/* Description of Service */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">2. Description of Service</h2>
          <p className="text-gray-300 mb-4">
            Our platform provides:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">Cryptocurrency price data and market information</li>
            <li className="mb-2">Technical analysis using professional indicators (RSI, MACD, Moving Averages, Bollinger Bands)</li>
            <li className="mb-2">Market sentiment analysis (Fear & Greed Index)</li>
            <li className="mb-2">Probability-based price predictions</li>
            <li className="mb-2">Educational content about cryptocurrencies and trading</li>
            <li className="mb-2">Blog and news articles about the crypto market</li>
          </ul>
        </section>

        {/* Accuracy and Reliability */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">3. Accuracy and Reliability</h2>
          <p className="text-gray-300 mb-4">
            While we strive to provide accurate and up-to-date information:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">
              <strong>No Guarantees:</strong> We make no warranties or guarantees about the accuracy, 
              completeness, or reliability of our predictions or analysis.
            </li>
            <li className="mb-2">
              <strong>Prediction Limitations:</strong> Our predictions are based on historical data and 
              technical indicators. They cannot predict sudden news events, regulatory changes, market 
              manipulation, or other unforeseen circumstances.
            </li>
            <li className="mb-2">
              <strong>Third-Party Data:</strong> We rely on third-party APIs (CoinGecko, Alternative.me, 
              Binance) for data. We are not responsible for errors or delays in their data.
            </li>
            <li className="mb-2">
              <strong>Market Volatility:</strong> Cryptocurrency markets are highly volatile and 
              unpredictable. Past performance does not indicate future results.
            </li>
          </ul>
        </section>

        {/* Investment Risks */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">4. Investment Risks</h2>
          <p className="text-gray-300 mb-4">
            By using this platform, you acknowledge and understand that:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">Cryptocurrency investments carry substantial risk of loss</li>
            <li className="mb-2">You may lose some or all of your invested capital</li>
            <li className="mb-2">Cryptocurrency markets are highly volatile and speculative</li>
            <li className="mb-2">Prices can fluctuate significantly in short periods</li>
            <li className="mb-2">Our predictions may be incorrect</li>
            <li className="mb-2">You should only invest what you can afford to lose completely</li>
            <li className="mb-2">You should conduct your own independent research</li>
            <li className="mb-2">You should consult with licensed financial advisors</li>
          </ul>
        </section>

        {/* User Responsibilities */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">5. User Responsibilities</h2>
          <p className="text-gray-300 mb-4">As a user of this platform, you agree to:</p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">Use the platform for lawful purposes only</li>
            <li className="mb-2">Conduct your own research before making investment decisions</li>
            <li className="mb-2">Not rely solely on our predictions for investment decisions</li>
            <li className="mb-2">Understand and accept all investment risks</li>
            <li className="mb-2">Not hold us liable for any investment losses</li>
            <li className="mb-2">Comply with all applicable laws and regulations in your jurisdiction</li>
            <li className="mb-2">Not use the platform to manipulate markets or engage in illegal activities</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">6. Limitation of Liability</h2>
          <p className="text-gray-300 mb-4">
            To the fullest extent permitted by law:
          </p>
          <ul className="list-disc pl-6 mb-4 text-gray-300">
            <li className="mb-2">
              We are NOT liable for any direct, indirect, incidental, special, or consequential damages 
              resulting from your use of this platform
            </li>
            <li className="mb-2">
              We are NOT responsible for any investment losses or financial damages you may incur
            </li>
            <li className="mb-2">
              We are NOT liable for errors, omissions, or inaccuracies in our predictions or data
            </li>
            <li className="mb-2">
              We are NOT responsible for third-party service failures or data inaccuracies
            </li>
            <li className="mb-2">
              We provide this platform "AS IS" without warranties of any kind, express or implied
            </li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">7. Intellectual Property</h2>
          <p className="text-gray-300 mb-4">
            All content on this platform, including but not limited to text, graphics, logos, algorithms, 
            and software, is the property of the platform owners or its licensors and is protected by 
            intellectual property laws. You may not copy, reproduce, distribute, or create derivative 
            works without explicit permission.
          </p>
        </section>

        {/* Third-Party Links and Services */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">8. Third-Party Links and Services</h2>
          <p className="text-gray-300 mb-4">
            Our platform may contain links to third-party websites and integrates with third-party APIs. 
            We are not responsible for the content, privacy practices, or services of these third parties. 
            Your use of third-party services is at your own risk and subject to their terms and conditions.
          </p>
        </section>

        {/* Age Restrictions */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">10. Age Restrictions</h2>
          <p className="text-gray-300 mb-4">
            You must be at least 18 years old to use this platform. By using this Service, you represent 
            and warrant that you are of legal age to form a binding contract.
          </p>
        </section>

        {/* Termination */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">10. Termination</h2>
          <p className="text-gray-300 mb-4">
            We reserve the right to terminate or suspend access to our Service immediately, without prior 
            notice or liability, for any reason, including breach of these Terms. Upon termination, your 
            right to use the Service will immediately cease.
          </p>
        </section>

        {/* Changes to Terms */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">12. Changes to Terms</h2>
          <p className="text-gray-300 mb-4">
            We reserve the right to modify or replace these Terms at any time. We will provide notice of 
            any material changes by posting the new Terms on this page and updating the "Last Updated" date. 
            Your continued use of the platform after any changes constitutes acceptance of the new Terms.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">12. Governing Law</h2>
          <p className="text-gray-300 mb-4">
            These Terms shall be governed by and construed in accordance with the laws of your jurisdiction, 
            without regard to its conflict of law provisions. Any disputes arising from these Terms or your 
            use of the Service shall be resolved in the appropriate courts.
          </p>
        </section>

        {/* Severability */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">14. Severability</h2>
          <p className="text-gray-300 mb-4">
            If any provision of these Terms is held to be unenforceable or invalid, such provision will be 
            changed and interpreted to accomplish the objectives of such provision to the greatest extent 
            possible under applicable law, and the remaining provisions will continue in full force and effect.
          </p>
        </section>

        {/* Contact Information */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">14. Contact Information</h2>
          <p className="text-gray-300 mb-4">
            If you have any questions about these Terms and Conditions, please contact us.
          </p>
        </section>

        {/* Final Disclaimer */}
        <section className="mb-8 p-6 bg-yellow-900 bg-opacity-20 rounded-lg border-2 border-yellow-600">
          <h2 className="text-xl font-bold text-yellow-200 mb-3">⚠️ Final Important Reminder</h2>
          <p className="text-yellow-100 mb-3">
            <strong>Cryptocurrency trading and investment involves substantial risk of loss.</strong> Our 
            platform provides analysis tools and predictions, but these should never be your sole basis for 
            investment decisions.
          </p>
          <p className="text-yellow-100 font-bold">
            Always conduct thorough research, diversify your investments, never invest more than you can 
            afford to lose, and consider consulting with licensed financial advisors before making any 
            investment decisions.
          </p>
        </section>

        {/* Acknowledgment */}
        <section className="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Acknowledgment</h2>
          <p className="text-gray-900">
            By using this platform, you acknowledge that you have read, understood, and agree to be bound 
            by these Terms and Conditions. You also acknowledge that you understand the risks associated 
            with cryptocurrency investment and that you are using this platform at your own risk.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
