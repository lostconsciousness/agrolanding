'use client';

import type { Paddle, PricePreviewParams, PricePreviewResponse } from '@paddle/paddle-js';
import { useEffect, useState } from 'react';
import { configuredPriceIds } from '@/lib/pricing-tiers';

export type PaddlePrices = Record<string, string>;

function getFormattedTotals(preview: PricePreviewResponse): PaddlePrices {
  return preview.data.details.lineItems.reduce<PaddlePrices>((prices, item) => {
    prices[item.price.id] = item.formattedTotals.total;
    return prices;
  }, {});
}

export function usePaddlePrices(paddle: Paddle | undefined, countryCode?: string) {
  const [prices, setPrices] = useState<PaddlePrices>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paddle) return;
    if (configuredPriceIds.length === 0) {
      setLoading(false);
      setError('No Paddle Price IDs are configured.');
      return;
    }

    let cancelled = false;
    const params: PricePreviewParams = {
      items: configuredPriceIds.map((priceId) => ({ priceId, quantity: 1 })),
      ...(countryCode ? { address: { countryCode } } : {}),
    };

    setLoading(true);
    setError(null);

    paddle
      .PricePreview(params)
      .then((preview) => {
        if (!cancelled) setPrices(getFormattedTotals(preview));
      })
      .catch((priceError: unknown) => {
        console.error('Unable to load localized Paddle prices', priceError);
        if (!cancelled) setError('Localized prices are temporarily unavailable.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [countryCode, paddle]);

  return { prices, loading, error };
}

