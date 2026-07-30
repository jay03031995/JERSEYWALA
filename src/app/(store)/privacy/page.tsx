import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — The Jersey Wala',
  description:
    'How The Jersey Wala (operated by Genesis Virtue LLP) collects, uses, and protects your personal information.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12" style={{ color: 'var(--fg)' }}>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Privacy Policy</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--fg-sub)' }}>
        Last updated: 12 May 2026
      </p>

      <section className="space-y-8 text-[15px] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
        <p>
          The Jersey Wala (<a href="https://thejerseywala.in" className="underline">thejerseywala.in</a>) is
          operated, managed, and hosted by <strong>Genesis Virtue LLP</strong>. This Privacy Policy
          explains what personal information we collect when you use the website and how we use it.
          By using the website you agree to the practices described here.
        </p>

        <div>
          <h2 className="text-xl font-semibold mb-3">1. Information we collect</h2>
          <p>We collect the following categories of information:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Account information</strong> — name, email, phone number, password (hashed) when you create an account.</li>
            <li><strong>Order information</strong> — shipping address, billing address, items ordered, payment method.</li>
            <li><strong>Payment information</strong> — processed securely by Cashfree. We do not store full card or banking details on our servers.</li>
            <li><strong>Usage and device data</strong> — IP address, browser type, pages visited, and approximate location, collected through cookies and similar technologies.</li>
            <li><strong>Communications</strong> — messages you send us by email, contact form, chat, or social media.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. How we use your information</h2>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Process and deliver your orders, including arranging shipping with our courier partners.</li>
            <li>Provide customer support, including responding to returns, exchanges, and queries.</li>
            <li>Send transactional messages — order confirmations, dispatch updates, and account notifications.</li>
            <li>Improve the website, our products, and our services.</li>
            <li>Detect, prevent, and respond to fraud or abuse.</li>
            <li>Comply with legal obligations under Indian law.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Cookies</h2>
          <p>
            We use cookies and similar technologies to keep you signed in, remember items in your
            cart, understand how the website is used, and personalise your experience. You can
            disable cookies in your browser settings; some features may not work without them.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Sharing of information</h2>
          <p>We share personal information only with:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li><strong>Service providers</strong> — payment gateways, courier partners, email/SMS providers, hosting and analytics providers acting on our behalf.</li>
            <li><strong>Legal and regulatory authorities</strong> — where required by Indian law, court order, or to protect our rights.</li>
            <li><strong>Successors</strong> — in the event of a merger, acquisition, or sale of business assets.</li>
          </ul>
          <p className="mt-2">
            We do not sell your personal information to third parties.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Data retention</h2>
          <p>
            We retain personal information for as long as your account is active and for a
            reasonable period afterwards to comply with our legal, accounting, or reporting
            obligations. You may request deletion of your account by writing to us.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Security</h2>
          <p>
            We use industry-standard technical and organisational measures to protect your
            information, including TLS encryption in transit and access controls on our systems.
            No method of transmission or storage is 100% secure; please use a strong, unique
            password and contact us immediately if you suspect unauthorised access to your account.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Your rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Access the personal information we hold about you.</li>
            <li>Correct inaccurate information.</li>
            <li>Request deletion of your account and associated data, subject to applicable legal requirements.</li>
            <li>Withdraw consent for marketing communications at any time.</li>
          </ul>
          <p className="mt-2">
            To exercise these rights, email{' '}
            <a href="mailto:hello@thejerseywala.in" className="underline">hello@thejerseywala.in</a>.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. Children</h2>
          <p>
            The website is not intended for users under 18. We do not knowingly collect personal
            information from children. If you believe we have collected information from a child,
            please contact us so we can delete it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Changes to this Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The updated version will be
            effective when posted on this page. Continued use of the website after changes are
            posted constitutes acceptance of the revised Policy.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
          <p>
            Privacy questions and requests can be sent to{' '}
            <a href="mailto:hello@thejerseywala.in" className="underline">hello@thejerseywala.in</a>.
          </p>
          <p className="mt-4" style={{ color: 'var(--fg-sub)' }}>
            <strong style={{ color: 'var(--fg)' }}>Data controller</strong>
            <br />
            Genesis Virtue LLP
            <br />
            Gurugram, Haryana, India
          </p>
        </div>
      </section>
    </main>
  )
}
