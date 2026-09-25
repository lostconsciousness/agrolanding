import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Privacy Policy — CORE AGRO',
  description: 'How CORE AGRO handles account, agricultural business, chat and subscription data.',
};

export default function PrivacyPage() {
  return (
    <LegalDocument
      language="en"
      eyebrow="Terms and policies"
      title="Privacy policy"
      summary="This policy describes the information CORE AGRO uses to run its agricultural AI platform, who receives it, and how to request access or deletion."
      notice={<p>Privacy contact: <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a>. We do not ask you to send card details or one-time login codes by email.</p>}
      sections={[
        {
          id: 'who-we-are', title: '1. Who handles your data',
          content: <><p>CORE AGRO operates this platform and is the contact point for privacy requests about platform accounts, agricultural business information and chat history. Reach us at <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a>. Paddle separately handles payment transactions as merchant of record under its own privacy terms.</p><p>This policy applies to the CORE AGRO website and service. It does not replace the privacy policies of independent websites or services that we link to.</p></>,
        },
        {
          id: 'data', title: '2. Information we collect',
          content: <><p>Depending on how you use the service, we process:</p><ul><li>Account information such as your email address, login verification and session records.</li><li>Subscription and billing references such as Paddle customer and subscription IDs, plan, status and transaction details needed to grant access. Complete payment-card details are handled by Paddle, not stored by CORE AGRO.</li><li>Information you provide about your agricultural business, including farm profile details, crops, machinery, team and documents where you choose to enter them.</li><li>Chat messages, prompts, AI responses, conversation history, citations and feedback you choose to provide.</li><li>Technical and security data such as device or browser details, IP address, request times and error logs, where available through hosting and security services.</li></ul></>,
        },
        {
          id: 'purposes', title: '3. Why we use the information',
          content: <><p>We use account and subscription information to authenticate you, provide paid access, answer support requests and perform our contract with you. We use the agricultural profile and chat content you provide to respond to your requests and maintain conversation context. We use limited technical and security information to prevent abuse, troubleshoot problems and protect the service.</p><p>Where privacy law requires a legal basis, these activities rely on performance of our contract, our legitimate interests in operating and securing the service, compliance with legal obligations, or your consent where specifically requested. You can withdraw consent for an optional activity without affecting earlier lawful processing.</p></>,
        },
        {
          id: 'providers', title: '4. Service providers and disclosures',
          content: <><p>We share only information reasonably needed with providers that support the service. These may include Cloudflare for hosting and database infrastructure, Resend for delivering sign-in emails, OpenAI for processing AI requests and, where used, web search, and Paddle for checkout, subscriptions, tax and payment support. For example, relevant prompt and conversation context may be sent to OpenAI to generate a response.</p><p>We may also disclose information when required by law, to protect users or the service, or as part of a genuine business reorganization with appropriate safeguards. We do not sell your personal data to advertisers.</p></>,
        },
        {
          id: 'transfers', title: '5. International processing',
          content: <p>Our providers may process information in countries outside your own. Where required, international transfers are supported by applicable legal mechanisms and provider safeguards. Contact us if you need more information about the safeguards relevant to your data.</p>,
        },
        {
          id: 'retention', title: '6. Retention and security',
          content: <><p>We keep account, profile and chat information while your account is active and as needed to provide the service. When you request deletion or your account closes, we remove or anonymize information unless we need to retain it for legal, accounting, dispute-resolution or security purposes. Paddle may retain payment records under its own obligations. Backup and log copies may remain for a limited period before being overwritten.</p><p>We use reasonable technical and organizational safeguards, including controlled access and secure connections. No internet service can promise absolute security. Contact us promptly if you believe your account or information has been compromised.</p></>,
        },
        {
          id: 'rights', title: '7. Your choices and rights',
          content: <><p>Depending on your location, you may have rights to access, correct, delete, export or restrict use of your personal data, object to certain processing, and complain to a data protection authority. Email <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a> from the address linked to your account to make a request. We may need to verify your identity and may retain information where law permits or requires it.</p><p>You can stop future subscription renewals using the Paddle customer portal or your receipt link. Subscription cancellation does not automatically delete your CORE AGRO account or chat history; contact us separately for an account or data request.</p></>,
        },
        {
          id: 'cookies', title: '8. Cookies and similar technology',
          content: <p>We use essential session and security cookies or equivalent browser storage to keep you signed in and protect your account. Payment checkout may set its own necessary cookies under Paddle’s policies. The CORE AGRO platform does not use advertising cookies as part of the service described here.</p>,
        },
        {
          id: 'updates', title: '9. Updates and contact',
          content: <><p>We may update this policy as the service or legal requirements change. We will post a revised date and provide additional notice for material changes when appropriate.</p><p>For any privacy question or request, write to <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a>. For payment data held by Paddle, review <a href="https://www.paddle.com/legal/privacy" rel="noopener noreferrer" target="_blank">Paddle’s Privacy Notice</a> or contact Paddle directly.</p></>,
        },
      ]}
    />
  );
}
