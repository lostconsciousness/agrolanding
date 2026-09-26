import type { Metadata } from 'next';
import { LegalDocument } from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Контактна інформація — CORE AGRO',
  description: 'Дані продавця та контакти підтримки цифрового сервісу CORE AGRO.',
};

export default function ContactsPage() {
  return (
    <LegalDocument
      language="uk"
      eyebrow="Документи CORE AGRO"
      title="Контактна інформація"
      summary="Реквізити продавця та способи зв’язатися з командою CORE AGRO."
      sections={[
        {
          id: 'seller', title: '1. Інформація про продавця',
          content: <><p>ФОП Столяр Діана Дмитрівна</p><p>РНОКПП (ІПН): 3809204363</p></>,
        },
        {
          id: 'address', title: '2. Адреса',
          content: <><p>Адреса реєстрації ФОП: Україна, 23415, Вінницька обл., Могилів-Подільський р-н, с. Долиняни, вул. Миру, буд. 25.</p><p>Фактична адреса: Україна, 23415, Вінницька обл., Могилів-Подільський р-н, с. Долиняни, вул. Миру, буд. 25.</p></>,
        },
        {
          id: 'support', title: '3. Зв’язок із нами',
          content: <><p>Телефон: <a href="tel:+380638149872">+380 63 814 98 72</a></p><p>Email: <a href="mailto:coreagro10@gmail.com">coreagro10@gmail.com</a></p><p>З питань роботи сервісу, доступу, оплати та повернення коштів напишіть нам електронною поштою. Для швидшої перевірки платежу зазначте email облікового запису та номер транзакції. Не надсилайте дані банківської картки або одноразові коди входу.</p></>,
        },
      ]}
    />
  );
}
