'use client';
import {
  useEffect,
  useRef,
  useState,
  type SubmitEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import {
  ArrowUp,
  ArrowUpRight,
  Building2,
  CircleAlert,
  ExternalLink,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  Sprout,
  Tractor,
  Wheat,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import type { ChatListItem, ChatMessage } from '@/lib/chat-types';

interface ChatResponse {
  error?: string;
  chats: ChatListItem[];
  messages: ChatMessage[];
  context: string;
  ready: boolean;
  email: string;
  chatId: string;
}
async function responseData(response: Response): Promise<ChatResponse> {
  return (await response.json()) as ChatResponse;
}
function sourceHost(url: string) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol)
      ? parsed.hostname
      : null;
  } catch {
    return null;
  }
}

function MessageText({ message }: { message: ChatMessage }) {
  const nodes: ReactNode[] = [];
  let cursor = 0;
  const refs = [...message.citations].sort((a, b) => a.start - b.start);
  for (const [i, citation] of refs.entries()) {
    if (
      !sourceHost(citation.url) ||
      citation.start < cursor ||
      citation.end < citation.start ||
      citation.end > message.content.length
    )
      continue;
    nodes.push(message.content.slice(cursor, citation.start));
    nodes.push(
      <a
        key={i}
        href={citation.url}
        target="_blank"
        rel="noopener noreferrer"
        title={citation.title}
      >
        [{i + 1}] {citation.title}
      </a>,
    );
    cursor = citation.end;
  }
  nodes.push(message.content.slice(cursor));
  return <div className="chat-message-text">{nodes}</div>;
}
const prompts = [
  {
    icon: Wheat,
    title: 'Ціни на зерно',
    text: 'Допоможи порівняти актуальні закупівельні ціни на пшеницю в Україні. Які дані про мою партію потрібні?',
  },
  {
    icon: Building2,
    title: 'Знайти покупця',
    text: 'Як знайти та перевірити компанії, які купують кукурудзу в Польщі?',
  },
  {
    icon: Sprout,
    title: 'План для поля',
    text: 'Допоможи скласти план сівозміни. Які дані про поля потрібно надати?',
  },
  {
    icon: Tractor,
    title: 'Економіка господарства',
    text: 'Що врахувати, порівнюючи продаж зерна з елеватора та доставку покупцю?',
  },
];

export function ChatWorkspace() {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [context, setContext] = useState('');
  const [contextDraft, setContextDraft] = useState('');
  const [contextOpen, setContextOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phase, setPhase] = useState<
    'loading' | 'ready' | 'login' | 'paywall' | 'error'
  >('loading');
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState('');
  const [contextError, setContextError] = useState('');
  const bottom = useRef<HTMLDivElement>(null);
  const generation = useRef(0);
  const retry = useRef<{
    message: string;
    chatId: string | null;
    requestId: string;
  } | null>(null);
  async function load() {
    try {
      const res = await fetch('/api/chat', { cache: 'no-store' });
      const data = await responseData(res);
      if (res.status === 401) {
        setPhase('login');
        return;
      }
      if (res.status === 402) {
        setPhase('paywall');
        return;
      }
      if (!res.ok) throw new Error(data.error);
      setChats(data.chats);
      setContext(data.context);
      setContextDraft(data.context);
      setReady(data.ready);
      setEmail(data.email);
      setPhase('ready');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не вдалося завантажити чати.',
      );
      setPhase('error');
    }
  }
  useEffect(() => {
    // Defer initialization so Strict Mode's discarded mount doesn't send a request.
    let active = true;
    queueMicrotask(() => {
      if (active) void load();
    });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, pending]);
  async function selectChat(id: string) {
    if (busy) return;
    const current = ++generation.current;
    setSwitching(true);
    setError('');
    setMenuOpen(false);
    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(id)}`, {
        cache: 'no-store',
      });
      const data = await responseData(res);
      if (!res.ok) throw new Error(data.error);
      if (current === generation.current) {
        setSelected(id);
        setMessages(data.messages);
        setDraft('');
        retry.current = null;
      }
    } catch (err) {
      if (current === generation.current)
        setError(
          err instanceof Error ? err.message : 'Не вдалося відкрити чат.',
        );
    } finally {
      if (current === generation.current) setSwitching(false);
    }
  }
  function newChat() {
    if (busy) return;
    generation.current++;
    setSwitching(false);
    setSelected(null);
    setMessages([]);
    setDraft('');
    setError('');
    setMenuOpen(false);
    retry.current = null;
  }
  async function send(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || busy || switching) return;
    const request =
      retry.current?.message === message && retry.current.chatId === selected
        ? retry.current
        : { message, chatId: selected, requestId: crypto.randomUUID() };
    retry.current = request;
    setBusy(true);
    setPending(message);
    setError('');
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...request,
          chatId: request.chatId ?? undefined,
        }),
      });
      const data = await responseData(res);
      if (!res.ok) {
        if (res.status === 401) setPhase('login');
        if (res.status === 402) setPhase('paywall');
        throw new Error(data.error);
      }
      setSelected(data.chatId);
      setMessages(data.messages);
      setChats(data.chats);
      setDraft('');
      retry.current = null;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Зв’язок перервано. Повторіть запит — повідомлення не дублюватиметься.',
      );
    } finally {
      setBusy(false);
      setPending('');
    }
  }
  async function saveContext(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setContextError('');
    try {
      const res = await fetch('/api/chat/context', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: contextDraft }),
      });
      const data = await responseData(res);
      if (!res.ok) throw new Error(data.error);
      setContext(contextDraft.trim());
      setContextOpen(false);
    } catch (err) {
      setContextError(
        err instanceof Error ? err.message : 'Не вдалося зберегти.',
      );
    } finally {
      setSaving(false);
    }
  }
  async function logout() {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error();
      window.location.assign('/login');
    } catch {
      setError('Не вдалося вийти. Спробуйте ще раз.');
    }
  }
  const sidebar = (
    <>
      <Link href="/" className="chat-brand">
        <Leaf /> CORE·AGRO
      </Link>
      <Button className="chat-new" onClick={newChat} disabled={busy}>
        <Plus /> Новий чат
      </Button>
      <div className="chat-sidebar-label">
        ВАШІ ДІАЛОГИ <span>{chats.length}</span>
      </div>
      <nav className="chat-history" aria-label="Збережені чати">
        {chats.length ? (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => void selectChat(chat.id)}
              disabled={busy}
              aria-current={selected === chat.id ? 'page' : undefined}
              className={selected === chat.id ? 'selected' : ''}
            >
              <MessageSquare />
              <span>{chat.title}</span>
            </button>
          ))
        ) : (
          <p>Тут з’являться ваші розмови.</p>
        )}
      </nav>
      <div className="chat-sidebar-bottom">
        <button
          onClick={() => {
            setContextDraft(context);
            setContextOpen(true);
            setMenuOpen(false);
          }}
          disabled={busy}
        >
          <Settings2 /> Контекст господарства
        </button>
        <Link href="/account">
          <ShieldCheck /> Моя підписка
        </Link>
        <button onClick={() => void logout()} disabled={busy}>
          <LogOut /> Вийти
        </button>
        <span>{email}</span>
      </div>
    </>
  );
  if (phase !== 'ready')
    return (
      <main className="agro-workspace login-shell" lang="uk">
        <section className="login-card">
          <Link href="/" className="chat-brand">
            <Leaf /> CORE·AGRO
          </Link>
          {phase === 'loading' ? (
            <>
              <LoaderCircle className="animate-spin" />
              <h1>Відкриваємо ваш кабінет…</h1>
            </>
          ) : (
            <>
              <div className="login-symbol">
                <ShieldCheck />
              </div>
              <h1>
                {phase === 'login'
                  ? 'Увійдіть до AI-кабінету'
                  : phase === 'paywall'
                    ? 'AI для вашого господарства'
                    : 'Не вдалося відкрити кабінет'}
              </h1>
              <p>
                {phase === 'login'
                  ? 'Підтвердіть email вашої підписки, щоб відкрити чат та історію розмов.'
                  : phase === 'paywall'
                    ? 'Чати й контекст доступні з активною підпискою CORE AGRO. Після оплати активація може тривати близько хвилини.'
                    : error}
              </p>
              <Link
                className="chat-primary"
                href={phase === 'login' ? '/login' : '/pricing'}
              >
                {phase === 'login' ? 'Увійти за email' : 'Переглянути тарифи'}
                <ArrowUpRight />
              </Link>
              {phase !== 'login' && (
                <>
                  <Button className="chat-new" onClick={() => void load()}>
                    <RefreshCw /> Перевірити статус
                  </Button>
                  <Link href="/login" className="chat-text-link">
                    Увійти з іншою поштою
                  </Link>
                </>
              )}
            </>
          )}
        </section>
      </main>
    );
  return (
    <main className="agro-workspace chat-shell" lang="uk">
      <aside className="chat-sidebar">{sidebar}</aside>
      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent
          side="left"
          className="agro-workspace !w-[300px] !bg-[#0a1710] !text-white !p-5"
        >
          <SheetTitle className="sr-only">Ваші діалоги</SheetTitle>
          <SheetDescription className="sr-only">
            Історія розмов та налаштування
          </SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>
      <section className="chat-main">
        <header className="chat-topbar">
          <Button
            className="chat-mobile-menu"
            variant="ghost"
            aria-label="Відкрити діалоги"
            onClick={() => setMenuOpen(true)}
          >
            <Menu />
          </Button>
          <div>
            <strong>Агроасистент</strong>
            <span>CORE AGRO / AI workspace</span>
          </div>
          <Button
            variant="ghost"
            className="chat-context-button"
            onClick={() => {
              setContextDraft(context);
              setContextOpen(true);
            }}
            disabled={busy}
          >
            <Settings2 />
            <span>{context ? 'Контекст збережено' : 'Додати контекст'}</span>
          </Button>
        </header>
        <div className="chat-scroll" aria-busy={busy || switching}>
          {switching ? (
            <div className="chat-loading">
              <LoaderCircle className="animate-spin" /> Відкриваємо діалог…
            </div>
          ) : messages.length === 0 && !pending ? (
            <div className="chat-empty">
              <div className="chat-empty-mark">
                <Sprout />
              </div>
              <p className="chat-kicker">ВАШ ПАРТНЕР В АГРОБІЗНЕСІ</p>
              <h1>
                Що сьогодні
                <br />
                <span>вирішуємо?</span>
              </h1>
              <p>
                Ціни, покупці, поля та господарство.
                <br />
                Почніть із запитання — деталі збережуться в діалозі.
              </p>
              <div className="chat-suggestions">
                {prompts.map(({ icon: Icon, title, text }) => (
                  <button key={title} onClick={() => setDraft(text)}>
                    <Icon />
                    <strong>{title}</strong>
                    <ArrowUpRight />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="chat-transcript">
              {messages.map((message) => (
                <article
                  className={`chat-bubble ${message.role}`}
                  key={message.id}
                >
                  <div className="chat-author">
                    {message.role === 'assistant' ? (
                      <>
                        <Leaf /> CORE AGRO
                      </>
                    ) : (
                      'Ви'
                    )}
                    <time>
                      {new Date(message.createdAt).toLocaleTimeString('uk', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <MessageText message={message} />
                  {message.citations.length > 0 && (
                    <div className="chat-sources">
                      {Array.from(
                        new Map(
                          message.citations.map((c) => [c.url, c]),
                        ).values(),
                      )
                        .filter((c) => sourceHost(c.url))
                        .map((c) => (
                          <a
                            key={c.url}
                            href={c.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink />
                            {sourceHost(c.url)}
                          </a>
                        ))}
                    </div>
                  )}
                </article>
              ))}
              {pending && (
                <>
                  <article className="chat-bubble user">
                    <div className="chat-author">Ви</div>
                    <p>{pending}</p>
                  </article>
                  <output className="chat-thinking">
                    <LoaderCircle className="animate-spin" /> Перевіряю тему,
                    контекст і джерела…
                  </output>
                </>
              )}
            </div>
          )}
          <div ref={bottom} />
        </div>
        <div className="chat-composer-area">
          {!ready && (
            <output className="chat-notice">
              <CircleAlert /> AI ще налаштовується. Історія та контекст
              доступні.
            </output>
          )}
          {error && (
            <div className="chat-error" role="alert">
              {error}
              <button
                aria-label="Закрити повідомлення"
                onClick={() => setError('')}
              >
                <X />
              </button>
            </div>
          )}
          <form className="chat-composer" onSubmit={send}>
            <label className="sr-only" htmlFor="chat-input">
              Ваше аграрне запитання
            </label>
            <Textarea
              id="chat-input"
              placeholder="Запитайте про зерно, покупців або своє господарство…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={6000}
              disabled={busy}
              onKeyDown={(e) => {
                if (
                  e.key === 'Enter' &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing
                ) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
            />
            <div className="chat-composer-actions">
              <span>
                <ShieldCheck /> Лише агротематика
              </span>
              <Button
                type="submit"
                aria-label="Надіслати повідомлення"
                disabled={!ready || busy || switching || !draft.trim()}
              >
                {busy ? <LoaderCircle className="animate-spin" /> : <ArrowUp />}
              </Button>
            </div>
          </form>
          <p className="chat-footnote">
            Повідомлення та контекст передаються OpenAI для відповіді.
            Перевіряйте дату й умови цін у джерелах.
          </p>
        </div>
      </section>
      <Sheet open={contextOpen} onOpenChange={setContextOpen}>
        <SheetContent className="agro-workspace !w-[min(100%,480px)] !max-w-[480px] !bg-[#0a1710] !p-6 !text-white">
          <SheetTitle className="!text-white !text-2xl">
            Контекст господарства
          </SheetTitle>
          <SheetDescription className="!text-white/60 !text-base !leading-7">
            Ці дані враховуються в усіх ваших чатах. Зберігайте тут тільки те,
            чим хочете поділитися з AI.
          </SheetDescription>
          <form className="context-form" onSubmit={saveContext}>
            <label htmlFor="farm-context">
              Країна, регіон, культури, площа, обсяги, логістика та цілі
            </label>
            <Textarea
              id="farm-context"
              value={contextDraft}
              onChange={(e) => setContextDraft(e.target.value)}
              maxLength={5000}
              placeholder="Україна, Вінницька область. Вирощуємо пшеницю та кукурудзу. Плануємо продати 200 т…"
            />
            <span>{contextDraft.length} / 5000</span>
            {contextError && (
              <p role="alert" className="chat-error">
                {contextError}
              </p>
            )}
            <Button className="chat-primary" type="submit" disabled={saving}>
              {saving ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <ShieldCheck />
              )}{' '}
              Зберегти контекст
            </Button>
            <p>
              Щоб очистити пам’ять профілю, видаліть текст і збережіть. Старі
              повідомлення залишаться у своїх діалогах.
            </p>
          </form>
        </SheetContent>
      </Sheet>
    </main>
  );
}
