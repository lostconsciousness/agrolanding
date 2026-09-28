// One shared deadline; never restarted per visitor or browser.
export const launchOffer = {
  endsAt: '2026-10-28T00:00:00Z',
  regularAnnualUsd: { basic: '$760', business: '$1,260', max: '$1,740' },
} as const;
