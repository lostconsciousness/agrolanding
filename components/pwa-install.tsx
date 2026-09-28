'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Download, X } from 'lucide-react';

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}
const InstallContext = createContext<{ prompt: InstallPrompt | null; installed: boolean }>({ prompt: null, installed: false });

export function PwaProvider({ children }: { children: React.ReactNode }) {
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(display-mode: standalone)');
    const sync = () => setInstalled(media.matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const capture = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const complete = () => { setInstalled(true); setPrompt(null); };
    sync();
    media.addEventListener('change', sync);
    window.addEventListener('beforeinstallprompt', capture);
    window.addEventListener('appinstalled', complete);
    if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(console.error);
    return () => {
      media.removeEventListener('change', sync);
      window.removeEventListener('beforeinstallprompt', capture);
      window.removeEventListener('appinstalled', complete);
    };
  }, []);
  return <InstallContext.Provider value={{ prompt, installed }}>{children}</InstallContext.Provider>;
}

export function PwaInstallButton() {
  const { prompt, installed } = useContext(InstallContext);
  const dialog = useRef<HTMLDialogElement>(null);
  if (installed) return null;
  const install = async () => {
    if (prompt) {
      try { await prompt.prompt(); await prompt.userChoice; } catch { dialog.current?.showModal(); }
    } else dialog.current?.showModal();
  };
  return <>
    <button type="button" className="pwa-install" onClick={install}><Download size={19} /> Додати чат на головний екран</button>
    <dialog ref={dialog} className="pwa-dialog">
      <button type="button" className="pwa-close" aria-label="Закрити" onClick={() => dialog.current?.close()}><X /></button>
      <h2>CORE AGRO завжди поруч</h2>
      <p>На iPhone або iPad відкрийте сайт у Safari, натисніть «Поділитися», потім «На початковий екран» та «Додати».</p>
      <p>У Chrome або Edge відкрийте меню браузера та виберіть «Встановити застосунок» або «Додати на головний екран», якщо цей пункт доступний.</p>
      <p>Іконка відкриватиме чат. Для входу потрібен ваш підтверджений email; для відповідей AI — інтернет.</p>
    </dialog>
  </>;
}
