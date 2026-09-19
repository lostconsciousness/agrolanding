export interface Tier {
  name: 'CORE BASIC' | 'CORE BUSINESS' | 'CORE MAX';
  id: 'basic' | 'business' | 'max';
  description: string;
  features: string[];
  featured: boolean;
  priceId: string;
}

export const pricingTiers: Tier[] = [
  {
    name: 'CORE BASIC',
    id: 'basic',
    description: 'For smaller farms that currently sell primarily in their local market.',
    features: [
      'Up to 5 users',
      'AI management assistant',
      'Agricultural knowledge base',
      'Recommendations and solution search',
      'Team tasks and employee control',
      'Reports and notifications',
    ],
    featured: false,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_BASIC ?? '',
  },
  {
    name: 'CORE BUSINESS',
    id: 'business',
    description: 'For farms selling larger volumes and losing margin to intermediaries.',
    features: [
      'Up to 10 users',
      'Everything in CORE BASIC',
      'Extended business profile',
      'Direct EU buyers and contacts',
      'Matching by price, volume and payment terms',
      'Up to 20 machines online',
    ],
    featured: true,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_BUSINESS ?? '',
  },
  {
    name: 'CORE MAX',
    id: 'max',
    description: 'For agricultural companies seeking €100–600k in development funding.',
    features: [
      'Up to 15 users',
      'Everything in CORE BASIC and CORE BUSINESS',
      'Loans and preferential financing',
      'EU grants and programmes',
      'Application autofill and submission',
      'Up to 50 machines online',
    ],
    featured: false,
    priceId: process.env.NEXT_PUBLIC_PADDLE_PRICE_MAX ?? '',
  },
];

export const configuredPriceIds = pricingTiers.map((tier) => tier.priceId).filter(Boolean);
