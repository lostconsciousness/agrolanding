import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Refund Policy — CORE AGRO',
  description: 'Refund and cancellation terms for CORE AGRO annual subscriptions purchased through Paddle.',
};

export default function RefundsPage() {
  return (
    <LegalDocument
      language="en"
      eyebrow="Terms and policies"
      title="Refund policy"
      summary="CORE AGRO plans are billed annually through Paddle. Here is how cancellations, refund requests and statutory rights work."
      notice={<p>To request a refund or report a billing issue, use the support link in your Paddle receipt or visit <a href="https://paddle.net" rel="noopener noreferrer" target="_blank">paddle.net</a>. You may also email <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a> so we can help investigate.</p>}
      sections={[
        {
          id: 'billing', title: '1. Annual billing',
          content: <><p>CORE BASIC, CORE BUSINESS and CORE MAX are annual subscriptions. Before payment, Paddle Checkout displays the final price, currency, taxes and renewal terms. The full annual amount is normally charged when you subscribe and again on each renewal unless you cancel in time.</p><p>Paddle is the merchant of record for purchases made through our checkout. Your receipt and invoice come from Paddle. CORE AGRO does not store your complete card details and cannot directly reverse a card charge outside Paddle’s payment process.</p></>,
        },
        {
          id: 'cancel', title: '2. Canceling renewal',
          content: <><p>You can cancel automatic renewal at any time using the Paddle customer portal or the link in your purchase receipt. If you need help locating it, contact <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a>. Cancel before the next renewal date to prevent the next annual charge.</p><p>Canceling renewal normally keeps your paid access through the end of the current billing period. It does not automatically refund the current or any previous charge. Access may end sooner if a transaction is refunded, reversed or disputed.</p></>,
        },
        {
          id: 'eligibility', title: '3. Refund eligibility',
          content: <><p>We review requests for duplicate or incorrect charges, failure to receive access, and material service problems. Please contact us promptly with your order reference, account email and a description of the problem; do not send card numbers. We will investigate and work with Paddle on an appropriate remedy.</p><p>Except where applicable law or Paddle’s buyer terms require otherwise, annual subscription payments are not automatically refundable after purchase or renewal, and we do not promise a prorated refund for unused time. Eligible consumers may have statutory withdrawal or other refund rights depending on their location and the circumstances of purchase. Those rights are not limited by this policy.</p></>,
        },
        {
          id: 'request', title: '4. How to request a refund',
          content: <><p>Start with the support link in your Paddle receipt or submit a request at <a href="https://paddle.net" rel="noopener noreferrer" target="_blank">paddle.net</a>. Paddle handles payment refunds as merchant of record. You may copy <a href="mailto:hello@core-agro.ai">hello@core-agro.ai</a> or contact us separately if your request concerns service access or functionality.</p><p>Include your order or transaction ID, the email used at checkout, the date of the charge and why you are requesting a refund. Paddle or CORE AGRO may ask for information reasonably needed to verify and resolve the request. Approval, method and timing of any refund depend on the applicable law, payment method and Paddle’s processing rules.</p></>,
        },
        {
          id: 'chargebacks', title: '5. Disputes and chargebacks',
          content: <><p>If a charge looks unfamiliar or incorrect, please contact Paddle or us first so it can be investigated quickly. You retain any right to dispute a transaction with your payment provider. A chargeback or refund may cause the corresponding subscription access to be suspended or ended after the transaction status is confirmed.</p><p>For additional buyer information, see <a href="https://www.paddle.com/legal/buyer-terms" rel="noopener noreferrer" target="_blank">Paddle’s Buyer Terms</a> and <a href="https://www.paddle.com/legal/refund-policy" rel="noopener noreferrer" target="_blank">Paddle’s Refund Policy</a>.</p></>,
        },
      ]}
    />
  );
}
