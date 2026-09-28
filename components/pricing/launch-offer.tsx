'use client';
import { useEffect, useState } from 'react';
import { Clock3, Tag } from 'lucide-react';
import { launchOffer } from '@/lib/launch-offer';

export function LaunchOffer() {
  const [remaining, setRemaining] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, Date.parse(launchOffer.endsAt) - Date.now()));
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  if (remaining === 0) return null;
  const minutes = remaining === null ? null : Math.ceil(remaining / 60_000);
  return (
    <div className="launch-offer">
      <div><Tag size={22} strokeWidth={1.75} /><strong>Стартова пропозиція −50%</strong></div>
      <span>Поточні базові річні ціни вже зі знижкою.</span>
      <div><Clock3 size={20} strokeWidth={1.75} />
        <time dateTime={launchOffer.endsAt}>
          {minutes === null ? 'До 28 жовтня 2026, 00:00 UTC' : `${Math.floor(minutes / 1440)} дн. ${Math.floor(minutes % 1440 / 60)} год. ${minutes % 60} хв.`}
        </time>
      </div>
      <small>Акція до 28.10.2026, 00:00 UTC. Локальну валюту та податки розраховує Paddle.</small>
    </div>
  );
}

export function RegularPrice({ plan }: { plan: keyof typeof launchOffer.regularAnnualUsd }) {
  const [active, setActive] = useState(false);
  useEffect(() => {
    const tick = () => setActive(Date.now() < Date.parse(launchOffer.endsAt));
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  if (!active) return null;
  return <p className="regular-price"><s>{launchOffer.regularAnnualUsd[plan]} / рік</s><span>Звичайна базова ціна USD</span></p>;
}
