import { getAuthenticatedUser } from '@/lib/server/auth';
import { getBillingByEmail } from '@/lib/server/billing-store';
import { getPaddleInstance } from '@/lib/server/paddle';
import { assertSameOrigin, apiError } from '@/lib/server/http';

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const user = await getAuthenticatedUser(request.headers);
    if (!user) {
      return Response.json(
        { error: 'Authentication is required.' },
        { status: 401 },
      );
    }

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
    return apiError(error);
  }
}
