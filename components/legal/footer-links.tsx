export function FooterLinks({ className = '' }: { className?: string }) {
  return (
    <nav className={`footer-links ${className}`} aria-label="Правові документи та контакти">
      <a href="/terms">Правила та умови</a>
      <a href="/refunds">Правила повернення</a>
      <a href="/contacts">Контактна інформація</a>
    </nav>
  );
}
