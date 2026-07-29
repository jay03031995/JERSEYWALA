import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms & Conditions — The Jersey Wala',
  description:
    'Terms and conditions governing the use of thejerseywala.in. Operated and managed by Genesis Virtue LLP.',
  alternates: { canonical: '/terms' },
}

export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 py-12" style={{ color: 'var(--fg)' }}>
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">Terms &amp; Conditions</h1>
      <p className="text-sm mb-10" style={{ color: 'var(--fg-sub)' }}>
        Last updated: 12 May 2026
      </p>

      <section className="space-y-8 text-[15px] leading-relaxed" style={{ fontFamily: 'var(--font-inter)' }}>
        <p>
          Welcome to The Jersey Wala (<a href="https://thejerseywala.in" className="underline">thejerseywala.in</a>),
          a sports apparel store operating in India. The website is managed and hosted by{' '}
          <strong>Genesis Virtue LLP</strong>. By accessing or using this website, you agree to be
          bound by these Terms &amp; Conditions. If you do not agree, please do not use the website.
        </p>

        <div>
          <h2 className="text-xl font-semibold mb-3">1. About us</h2>
          <p>
            The Jersey Wala is a brand operated, managed, and hosted by Genesis Virtue LLP, a
            limited liability partnership registered under the laws of India. References to “we”,
            “us”, or “our” in these Terms refer to Genesis Virtue LLP operating The Jersey Wala.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Eligibility</h2>
          <p>
            You must be at least 18 years of age, or accessing the site under the supervision of a
            parent or legal guardian, to place an order. By placing an order you confirm you have
            the legal capacity to enter into a binding contract.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Products and pricing</h2>
          <p>
            All product descriptions, images, prices, and availability are provided in good faith
            and may be updated without notice. We make every effort to display colors accurately,
            but the actual product may vary slightly due to display or photography. Prices are
            displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated
            otherwise. We reserve the right to refuse or cancel any order, including for errors in
            pricing, stock, or fraud prevention.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Orders and payment</h2>
          <p>
            Placing an order constitutes an offer to buy. The contract is formed only when we
            confirm dispatch. Online payments are processed securely by Stripe and
            we do not store full card or banking details on our servers. Cash on Delivery may be
            available for select pin codes at our discretion.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Shipping and delivery</h2>
          <p>
            We ship across India through reputable courier partners. Delivery timelines are
            estimates and may vary due to courier delays, location, or unforeseen events. Risk of
            loss passes to you on delivery to the address provided. Please ensure your shipping
            address and contact number are accurate.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Returns, exchanges and refunds</h2>
          <p>
            Returns and exchanges are governed by our Returns &amp; Exchange policy linked in the
            footer. Customised or personalised jerseys (with player names or numbers) are made to
            order and are non-returnable except in cases of manufacturing defect. Refunds, where
            applicable, are credited to the original payment method within 7–14 business days.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">7. Authenticity and trademarks</h2>
          <p>
            Team names, crests, logos, sponsor marks and player names referenced on this site are
            trademarks of their respective owners and are used for descriptive purposes only. Where
            a product is sold as “fan edition” or “replica”, it is not represented as official
            licensed merchandise unless specifically stated.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">8. User accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and
            for all activity under your account. Notify us immediately of any unauthorised access.
            We may suspend or terminate accounts that violate these Terms or applicable law.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">9. Intellectual property</h2>
          <p>
            All website content — including the design, text, graphics, photographs, and the
            “Jersey Wala” brand — is the property of Genesis Virtue LLP or its licensors and is
            protected under Indian and international copyright and trademark laws. You may not
            reproduce, distribute, or create derivative works without prior written permission.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">10. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, Genesis Virtue LLP and The Jersey Wala shall
            not be liable for any indirect, incidental, or consequential losses arising from your
            use of the website. Our total liability for any claim relating to a product shall not
            exceed the amount you paid for that product.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">11. Privacy</h2>
          <p>
            Your use of the website is also governed by our Privacy Policy, which explains what
            information we collect and how we use it.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">12. Governing law and jurisdiction</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall be subject to the
            exclusive jurisdiction of the courts at Gurugram, Haryana.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">13. Changes to these Terms</h2>
          <p>
            We may revise these Terms from time to time. The updated version will be effective when
            posted on this page. Your continued use of the website after changes are posted
            constitutes acceptance of the revised Terms.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">14. Contact</h2>
          <p>
            Questions about these Terms can be sent to{' '}
            <a href="mailto:hello@thejerseywala.in" className="underline">hello@thejerseywala.in</a>.
          </p>
          <p className="mt-4" style={{ color: 'var(--fg-sub)' }}>
            <strong style={{ color: 'var(--fg)' }}>Operated, managed and hosted by</strong>
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
