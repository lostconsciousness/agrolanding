'use client';
import { useState, type SubmitEvent } from 'react';
import Link from 'next/link';
import { ArrowRight, Leaf, LoaderCircle, Mail } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';

export function LoginForm({ ready }: { ready: boolean }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [challenge, setChallenge] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(
        challenge ? '/api/auth/verify' : '/api/auth/request-code',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            challenge ? { challengeId: challenge, code } : { email },
          ),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        challengeId: string;
      };
      if (!response.ok) throw new Error(data.error);
      if (!challenge) {
        setChallenge(data.challengeId);
        return;
      }
      const next = new URLSearchParams(window.location.search).get('next');
      window.location.assign(
        next === '/pricing' || next === '/account' ? next : '/chat',
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Не вдалося увійти. Спробуйте ще раз.',
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="agro-workspace login-shell" lang="uk">
      <section className="login-card">
        <Link href="/" className="chat-brand">
          <Leaf /> CORE·AGRO
        </Link>
        <div className="login-symbol">
          <Mail />
        </div>
        <h1>
          Ваше господарство.
          <br />
          <span>Ваш AI-асистент.</span>
        </h1>
        <p>
          {challenge
            ? `Введіть код, надісланий на ${email}. Він діє 10 хвилин.`
            : 'Увійдіть за email, який використовували для підписки. Надішлемо одноразовий код.'}
        </p>
        {!ready && (
          <output className="chat-notice">
            Вхід готується до запуску. Зверніться до підтримки:
            hello@core-agro.ai.
          </output>
        )}
        <form onSubmit={submit}>
          {challenge ? (
            <>
              <label htmlFor="login-code">Код підтвердження</label>
              <InputOTP
                id="login-code"
                maxLength={6}
                value={code}
                onChange={setCode}
                pattern="[0-9]*"
                autoComplete="one-time-code"
                disabled={busy}
              >
                <InputOTPGroup>
                  {Array.from({ length: 6 }, (_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="!h-12 !w-10 !border-white/20 !text-xl sm:!w-12"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </>
          ) : (
            <>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                maxLength={254}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@farm.com"
                disabled={busy}
              />
            </>
          )}
          {error && (
            <p className="chat-error" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="chat-primary"
            disabled={!ready || busy || Boolean(challenge && code.length !== 6)}
          >
            {busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}
            {challenge ? 'Увійти' : 'Отримати код'}
          </Button>
          {challenge && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setChallenge('');
                setCode('');
                setError('');
              }}
              disabled={busy}
            >
              Інша адреса або новий код
            </Button>
          )}
        </form>
        <Link href="/pricing" className="chat-text-link">
          Ще немає підписки? Переглянути тарифи
        </Link>
      </section>
    </main>
  );
}
