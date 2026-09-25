import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Terms of Service — CORE AGRO',
  description: 'Terms for using the CORE AGRO agricultural AI platform and its annual subscriptions.',
};

export default function TermsPage() {
  return (
    <LegalDocument
      language="en"
      eyebrow="Terms and policies"
      title="Terms of service"
      summary="These terms explain how you may use CORE AGRO, how annual subscriptions work, and the responsibilities that come with an AI-assisted agricultural service."
      notice={<p>Questions about these terms or your account? Email <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a>. For payment and invoice questions, you can also use the support link in your Paddle receipt.</p>}
      sections={[
        {
          id: 'agreement', title: '1. Agreement and service',
          content: <><p>CORE AGRO is a digital platform for agricultural businesses. It provides an AI-assisted workspace for questions, research, company context and related tools made available in your plan. By creating an account, accessing the service or purchasing a subscription, you agree to these terms and our <a href="/privacy">Privacy Policy</a> and <a href="/refunds">Refund Policy</a>.</p><p>Use the service only if you are legally able to enter into this agreement. If you act for an organization, you confirm that you are authorized to bind it. The service is intended for business use and is not directed at children.</p></>,
        },
        {
          id: 'account', title: '2. Accounts and access',
          content: <><p>Sign-in may use a one-time code sent to your email address. Keep access to that mailbox secure, provide accurate account information and promptly tell us at <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a> if you suspect unauthorized access. You are responsible for activity under your account except where caused by our breach of these terms or applicable law.</p><p>Paid features require a qualifying subscription. Available features and seat limits depend on the plan shown on the <a href="/pricing">pricing page</a> and at checkout. We may change, improve or discontinue individual features, but will take reasonable steps to avoid a material reduction of the core paid service during a current paid term.</p></>,
        },
        {
          id: 'subscriptions', title: '3. Annual subscriptions and billing',
          content: <><p>CORE BASIC, CORE BUSINESS and CORE MAX are annual subscriptions. The checkout shows the final amount, currency, applicable taxes, billing period and renewal terms before you pay. Any localized price displayed on our site is an estimate until confirmed by Paddle Checkout; the amount shown in Paddle Checkout controls your purchase.</p><p>Paddle acts as merchant of record for online purchases and processes payments, invoices and applicable sales taxes. We do not receive or store your complete payment-card details. Unless you cancel before renewal, an annual plan renews automatically for another annual term at the price disclosed for that renewal, subject to any legally required notice. You may cancel future renewals through the Paddle customer portal or the link in your receipt. Cancellation normally leaves access in place until the current paid period ends; it does not itself refund a completed payment. See our <a href="/refunds">Refund Policy</a>.</p></>,
        },
        {
          id: 'permitted-use', title: '4. Acceptable use and your content',
          content: <><p>You may use the platform for lawful agricultural business purposes. Do not submit content you have no right to use; infringe another person’s rights; upload malware; attempt to bypass security or usage limits; scrape or reverse-engineer the service; or use it to generate deceptive, unlawful or harmful activity.</p><p>You retain ownership of information you enter, including agricultural and company data and chat messages. You grant us a limited right to host, process and transmit that information only as needed to operate, secure, support and improve the service, as described in our Privacy Policy. You are responsible for checking that information you submit is accurate and appropriate to share with AI and other service providers.</p></>,
        },
        {
          id: 'ai', title: '5. AI outputs and agricultural decisions',
          content: <><p>AI-generated answers, external information, market prices, buyer details, forecasts, grant opportunities and other outputs may be incomplete, outdated or incorrect. Where a response uses web search or a third-party source, that source is independent of CORE AGRO. We do not guarantee a sale, buyer, price, yield, loan, grant, profit or particular business result.</p><p>Review important information with original sources and qualified professionals before acting. You remain responsible for commercial, agronomic, financial and legal decisions, and for approving any external communication or submission. The platform is not an investment, legal, tax or regulated financial advisory service.</p></>,
        },
        {
          id: 'availability', title: '6. Availability, suspension and changes',
          content: <><p>We use reasonable efforts to keep the platform available and secure, but continuous or error-free service is not guaranteed. We may temporarily suspend access for maintenance, security, legal requirements or misuse. We may also suspend paid access when a subscription becomes ineligible or payment fails, subject to applicable law and any grace period we choose to offer.</p><p>We may update these terms by posting a revised version with a new effective date. For material changes affecting an active subscription, we will provide reasonable notice by email or within the service when practicable. If you disagree with a material change, you may cancel renewal and stop using the service.</p></>,
        },
        {
          id: 'intellectual-property', title: '7. Intellectual property',
          content: <p>CORE AGRO and its licensors retain rights in the platform, software, design, trademarks and documentation. Your subscription gives you a limited, non-exclusive, non-transferable right to use the service during the applicable term. It does not transfer ownership of the platform or of third-party sources displayed through it.</p>,
        },
        {
          id: 'liability', title: '8. Liability and legal rights',
          content: <><p>To the extent permitted by applicable law, the service is provided without a guarantee of uninterrupted operation or a particular commercial outcome. Neither party excludes liability that cannot legally be excluded, including liability for fraud or intentional misconduct. Nothing in these terms limits mandatory consumer, privacy or other statutory rights that apply to you.</p><p>To the extent permitted by law, CORE AGRO is not liable for indirect or consequential losses, lost profit, lost opportunity or losses arising solely from reliance on unverified AI output or third-party information. This does not excuse us from liability for our own breach where exclusion is prohibited by law.</p></>,
        },
        {
          id: 'contact', title: '9. Contact and complaints',
          content: <><p>For service, account or legal questions, contact CORE AGRO at <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a>. Please include the email used for your account and a description of the issue, but do not send card numbers or one-time login codes.</p><p>For payment, invoice, cancellation or refund issues, you may also contact Paddle through the support link in your receipt or at <a href="https://paddle.net" rel="noopener noreferrer" target="_blank">paddle.net</a>.</p></>,
        },
      ]}
    />
  );
}
