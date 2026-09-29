'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Leaf, LoaderCircle, Mail, ShieldCheck } from 'lucide-react';
import type { TrialAccess, TrialPlan } from '@/lib/server/trial-access';
import { LaunchOffer, RegularPrice } from '@/components/pricing/launch-offer';
import { PwaInstallButton } from '@/components/pwa-install';

const plans = [
  { id: 'basic', name: 'CORE BASIC', price: '$380', description: 'Для невеликого господарства', features: ['До 5 користувачів', 'Агроасистент і рекомендації', 'Задачі, звіти та сповіщення'] },
  { id: 'business', name: 'CORE BUSINESS', price: '$630', description: 'Для продажів та експорту', features: ['До 10 користувачів', 'Пошук покупців і контрагентів', 'До 20 одиниць техніки'] },
  { id: 'max', name: 'CORE MAX', price: '$870', description: 'Для розвитку господарства', features: ['До 15 користувачів', 'Фінансування, гранти та програми', 'До 50 одиниць техніки'] },
] as const;

export function StartPlans({ email, trial, initialPlan, permanentAccess = false }: { email?: string; trial: TrialAccess | null; initialPlan?: TrialPlan; permanentAccess?: boolean }) {
  const selected = initialPlan;
  const [busy, setBusy] = useState<TrialPlan | null>(null);
  const [error, setError] = useState('');
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const active = trial && now !== null && trial.expiresAt > now;
  async function start(plan: TrialPlan) {
    if (!email) {
      window.location.assign(`/login?next=/start&plan=${plan}`);
      return;
    }
    setBusy(plan);
    setError('');
    try {
      const response = await fetch('/api/trial', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ plan }) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error ?? 'Не вдалося активувати тест.');
      window.location.assign('/chat');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Спробуйте ще раз.');
      setBusy(null);
    }
  }
  return <main className="start-page agro-workspace" lang="uk">
    <header><Link className="chat-brand" href="/"><Leaf /> CORE·AGRO</Link><Link href="/account">Мій кабінет</Link></header>
    <section className="start-intro"><span className="start-kicker"><ShieldCheck size={22} /> 7 днів безкоштовно</span><h1>Оберіть план.<br /><span>Спробуйте на своїх задачах.</span></h1><p>Спочатку підтвердіть email — потім відкриється чат зі збереженими діалогами та контекстом. Без картки, оплати та автоматичного списання.</p>
      <p className="start-test-note">У тестовому режимі всі три плани відкривають один і той самий AI-чат. Інші можливості тарифів не активуються автоматично під час тесту.</p>
      {email && <p className="start-email"><Mail size={20} /> {email}</p>}
      {permanentAccess && <Link className="chat-primary" href="/chat">Відкрити чат · безстроковий доступ <ArrowRight size={22} /></Link>}
      {!permanentAccess && active && <Link className="chat-primary" href="/chat">Продовжити тест · до {new Date(trial.expiresAt).toLocaleString('uk-UA')} <ArrowRight size={22} /></Link>}
      {!permanentAccess && trial && now !== null && !active && <p className="chat-notice">Ваш безкоштовний тиждень завершився. Діалоги збережені; річна підписка знову відкриє доступ.</p>}
    </section>
    <LaunchOffer />
    {error && <p className="chat-error" role="alert">{error}</p>}
    <div className="start-plans">{plans.map(plan => <article key={plan.id} className={selected === plan.id ? 'selected' : ''}>
      <span className="start-plan-label">{selected === plan.id ? 'Ваш вибір' : 'Річний план'}</span><h2>{plan.name}</h2><p>{plan.description}</p><RegularPrice plan={plan.id} /><div className="start-price">{plan.price}<small>/ рік · базова ціна USD</small></div>
      <ul>{plan.features.map(feature => <li key={feature}><Check size={20} strokeWidth={1.75} />{feature}</li>)}</ul>
      {!permanentAccess && !trial && <button className="chat-primary" disabled={busy !== null} onClick={() => void start(plan.id)}>{busy === plan.id ? <LoaderCircle className="animate-spin" /> : <ArrowRight size={22} />} {email ? 'Активувати безкоштовний тиждень' : 'Тестувати безкоштовно 7 днів'}</button>}
      <Link className="start-subscribe" href="/pricing">Обрати річну підписку <ArrowRight size={20} /></Link>
    </article>)}</div>
    <p className="start-fineprint">Один тест на підтверджений email. 7 днів починаються після активації, а не при відкритті сторінки. Для платного плану підсумкову суму показує Paddle перед оплатою.</p>
    <div className="start-install"><PwaInstallButton /></div>
  </main>;
}
