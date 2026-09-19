import type { Metadata } from 'next';
import { ArrowRight, CircleCheck, Leaf, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Welcome to CORE AGRO',
  description: 'Your CORE AGRO subscription checkout is complete.',
};

export default function WelcomePage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#061009] px-5 py-16 text-[#f5f8f3]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(184,238,55,.16),transparent_38%),linear-gradient(rgba(184,238,55,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(184,238,55,.025)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />
      <section className="relative z-10 w-full max-w-2xl rounded-[2.5rem] border border-[#b8ee37]/35 bg-[#0a1810]/92 p-8 text-center shadow-[0_30px_100px_rgba(0,0,0,.35)] md:p-14">
        <span className="logo-mark large mx-auto"><CircleCheck size={28} /></span>
        <div className="mt-7 flex items-center justify-center gap-3 text-sm font-semibold tracking-[.16em]">
          <Leaf className="text-[#b8ee37]" size={19} /> CORE·AGRO
        </div>
        <h1 className="mt-8 text-balance text-5xl font-medium leading-[.95] tracking-[-.055em] md:text-7xl">
          Welcome aboard.
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-white/56 md:text-lg">
          Your checkout is complete. We’ll use your Paddle receipt details to arrange onboarding and the next steps.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/" className="primary-button">Return to CORE AGRO <ArrowRight size={18} /></a>
          <a href="mailto:hello@core-agro.ai" className="secondary-button"><Mail size={18} /> Contact support</a>
        </div>
      </section>
    </main>
  );
}

