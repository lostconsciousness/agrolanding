import { getAuthenticatedUser } from '@/lib/server/auth';
import { getBillingByEmail } from '@/lib/server/billing-store';
import { getPaddleInstance } from '@/lib/server/paddle';

export async function POST(request: Request) {
  const user = getAuthenticatedUser(request.headers);
  if (!user) {
    return Response.json({ error: 'Authentication is required.' }, { status: 401 });
  }

  try {
    const { customer, subscriptions } = await getBillingByEmail(user.email);
    if (!customer) {
      return Response.json(
        { error: 'No Paddle customer is linked to this account yet.' },
        { status: 404 },
      );
    }

    const session = await getPaddleInstance().customerPortalSessions.create(
      customer.customerId,
      subscriptions.map((subscription) => subscription.subscriptionId),
    );

    return Response.redirect(session.urls.general.overview, 303);
  } catch (error) {
    console.error('Unable to create Paddle customer portal session', error);
    return Response.json({ error: 'Unable to open billing management.' }, { status: 500 });
  }
}
