export type BillingFrequency = 'month' | 'year';

export interface Tier {
  name: 'Starter' | 'Pro' | 'Advanced';
  id: 'starter' | 'pro' | 'advanced';
  description: string;
  features: string[];
  featured: boolean;
  priceId: { month: string; year: string };
}

export const pricingTiers: Tier[] = [
  {
    name: 'Starter',
    id: 'starter',
    description: 'A clear operating layer for smaller farms.',
    features: [
      'Up to 5 users',
      'Management AI assistant',
      'Team tasks and control',
      'Reports and alerts',
    ],
    featured: false,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_MONTH ?? '',
      year:
        process.env.NEXT_PUBLIC_PADDLE_PRICE_STARTER_YEAR ??
        process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC ??
        '',
    },
  },
  {
    name: 'Pro',
    id: 'pro',
    description: 'Sales intelligence and machinery visibility for growing teams.',
    features: [
      'Up to 10 users',
      'Everything in Starter',
      'Direct EU buyer matching',
      'Up to 20 machines online',
    ],
    featured: true,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTH ?? '',
      year:
        process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_YEAR ??
        process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS ??
        '',
    },
  },
  {
    name: 'Advanced',
    id: 'advanced',
    description: 'Financing, grants and wider fleet control for complex operations.',
    features: [
      'Up to 15 users',
      'Everything in Pro',
      'Loans and grants workflows',
      'Up to 50 machines online',
    ],
    featured: false,
    priceId: {
      month: process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_MONTH ?? '',
      year:
        process.env.NEXT_PUBLIC_PADDLE_PRICE_ADVANCED_YEAR ??
        process.env.NEXT_PUBLIC_PADDLE_PRICE_MAX ??
        '',
    },
  },
];

export const configuredPriceIds = pricingTiers.flatMap((tier) =>
  [tier.priceId.month, tier.priceId.year].filter(Boolean),
);

