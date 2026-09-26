import type { ReactNode } from 'react';
import { ArrowLeft, CalendarDays, FileText, Leaf, ShieldCheck } from 'lucide-react';
import { FooterLinks } from './footer-links';

interface LegalSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface LegalDocumentProps {
  eyebrow: string;
  title: string;
  summary: string;
  sections: LegalSection[];
  notice?: ReactNode;
  language?: 'ru' | 'en' | 'uk';
  updated?: string;
}

export function LegalDocument({ eyebrow, title, summary, sections, notice, language = 'ru', updated }: LegalDocumentProps) {
  const english = language === 'en';
  const ukrainian = language === 'uk';
  return (
    <main lang={language} className="min-h-screen bg-[#061009] text-[#f5f8f3]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_72%_0%,rgba(184,238,55,.11),transparent_30%),linear-gradient(rgba(184,238,55,.022)_1px,transparent_1px),linear-gradient(90deg,rgba(184,238,55,.022)_1px,transparent_1px)] bg-[size:auto,72px_72px,72px_72px]" />

      <header className="relative z-20 border-b border-white/8 bg-[#061009]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-[1280px] items-center justify-between px-5 lg:px-10">
          <a className="brand flex items-center gap-3 font-semibold tracking-[0.16em]" href="/" aria-label="CORE AGRO">
            <span className="logo-mark"><Leaf size={20} strokeWidth={1.8} /></span> CORE·AGRO
          </a>
          <a className="secondary-button min-h-11 px-4 text-xs" href="/">
            <ArrowLeft size={20} strokeWidth={1.8} /> {english ? 'Back to home' : ukrainian ? 'На головну' : 'На главную'}
          </a>
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-[1280px] px-5 pb-24 pt-16 lg:px-10 lg:pb-32 lg:pt-24">
        <div className="max-w-5xl">
          <div className="flex w-fit items-center gap-2 rounded-full border border-[#b8ee37]/25 bg-[#b8ee37]/5 px-4 py-2 text-xs font-semibold uppercase tracking-[.16em] text-[#cef46d]">
            <FileText size={20} strokeWidth={1.8} /> {eyebrow}
          </div>
          <h1 className="mt-7 text-balance text-[clamp(3rem,7vw,6.7rem)] font-medium leading-[.92] tracking-[-.06em]">
            {title}
          </h1>
          <p className="mt-7 max-w-3xl text-base leading-8 text-white/56 md:text-lg">{summary}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/42">
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.025] px-4 py-2.5">
              <CalendarDays size={20} strokeWidth={1.8} className="text-[#b8ee37]" /> {updated ?? (english ? 'Effective 25 September 2026' : ukrainian ? 'Редакція від 26 вересня 2026 року' : 'Редакция от 19 сентября 2026 года')}
            </span>
            <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.025] px-4 py-2.5">
              <ShieldCheck size={20} strokeWidth={1.8} className="text-[#b8ee37]" /> CORE AGRO
            </span>
          </div>
        </div>

        {notice && (
          <div className="legal-copy mt-12 max-w-5xl rounded-[1.75rem] border border-[#b8ee37]/25 bg-[#b8ee37]/[.055] p-6 text-base leading-7 text-white/68 md:p-8">
            {notice}
          </div>
        )}

        <div className="mt-14 grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
          <aside className="lg:sticky lg:top-8 lg:self-start">
            <p className="font-mono text-[11px] uppercase tracking-[.18em] text-[#b8ee37]/65">{english ? 'On this page' : ukrainian ? 'Зміст' : 'Содержание'}</p>
            <nav className="mt-5 grid gap-1" aria-label={english ? 'Document contents' : ukrainian ? 'Зміст документа' : 'Содержание документа'}>
              {sections.map((section, index) => (
                <a key={section.id} href={`#${section.id}`} className="group flex items-start gap-3 rounded-xl px-3 py-3 text-sm leading-5 text-white/44 transition hover:bg-white/[.035] hover:text-white">
                  <span className="font-mono text-[11px] text-[#b8ee37]/60">0{index + 1}</span>
                  {section.title}
                </a>
              ))}
            </nav>
          </aside>

          <article className="min-w-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[#09160e]/88">
            {sections.map((section, index) => (
              <section id={section.id} key={section.id} className="scroll-mt-8 border-b border-white/9 p-6 last:border-b-0 md:p-10 lg:p-12">
                <div className="font-mono text-xs text-[#b8ee37]/62">0{index + 1}</div>
                <h2 className="mt-5 max-w-3xl text-2xl font-medium leading-tight tracking-[-.035em] md:text-4xl">{section.title}</h2>
                <div className="legal-copy mt-6 max-w-3xl text-base leading-7 text-white/64 md:leading-8">
                  {section.content}
                </div>
              </section>
            ))}
          </article>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/8">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <span>© 2026 CORE AGRO. {english ? 'All rights reserved.' : ukrainian ? 'Усі права захищено.' : 'Все права защищены.'}</span>
          <FooterLinks />
        </div>
      </footer>
    </main>
  );
}
