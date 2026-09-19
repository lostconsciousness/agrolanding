'use client';

import {
  ArrowRight,
  ArrowUpRight,
  Banknote,
  BarChart3,
  Bot,
  Check,
  ChevronDown,
  CircleDollarSign,
  CloudSun,
  FileCheck2,
  Fuel,
  Globe2,
  Leaf,
  Map,
  Menu,
  Play,
  Plus,
  Radar,
  Route,
  Satellite,
  ShieldCheck,
  Sparkles,
  Sprout,
  Tractor,
  Users,
  Wheat,
  X,
  Zap,
} from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

type Locale = 'uk' | 'en' | 'pl' | 'kk' | 'de';

const languages: Record<Locale, { short: string; name: string }> = {
  uk: { short: 'UA', name: 'Українська' },
  en: { short: 'EN', name: 'English' },
  pl: { short: 'PL', name: 'Polski' },
  kk: { short: 'KZ', name: 'Қазақша' },
  de: { short: 'DE', name: 'Deutsch' },
};

const copy = {
  uk: {
    nav: ['Платформа', 'Можливості', 'Як це працює', 'Тарифи'], login: 'Увійти', demo: 'Запросити демо',
    badge: 'AI-платформа для агробізнесу', heroA: 'Одне ядро.', heroB: 'Усе господарство.',
    heroText: 'Продажі, техніка, команда, фінансування й гранти — в одному AI-асистенті, який уже знає контекст вашого підприємства.',
    try: 'Спробувати CORE AGRO', watch: 'Дивитися можливості', scroll: 'Гортайте',
    stats: [['€100–600 тис.', 'цільовий діапазон фінансування'], ['до 50 одиниць', 'техніки онлайн у CORE MAX'], ['24/7', 'контекст господарства в AI'], ['2–5+ років', 'орієнтовний строк програм']],
    introKicker: 'Не ще одна складна система', introTitle: 'Ви пишете як людині. CORE AGRO діє як команда.',
    introText: 'Один раз розкажіть про землю, культури, техніку, людей і фінанси. Далі система пам’ятає контекст і повертає готовий результат — не загальну пораду.',
    chatLabel: 'Живий сценарій', prompts: ['Продай 700 т соняшнику не дешевше €440/т', 'Знайди €300 000 на 3 роки', 'Що сьогодні відбувається в господарстві?'],
    answers: [
      ['Знайдено 12 прямих покупців у ЄС', '7 працюють із передоплатою', '4 мають власну логістику'],
      ['Знайдено 4 потенційні програми', 'Діапазон — до €350–500 тис.', 'Чернетка переліку документів готова'],
      ['2 задачі прострочено', 'Трактор №7 поза геозоною', 'Комбайну №3 — ТО через 18 мотогодин'],
    ],
    result: 'CORE AGRO аналізує профіль підприємства та готує наступний крок.', confirm: 'Підтвердити дію',
    featuresKicker: 'Єдиний цифровий контур', featuresTitle: 'Усе, що керівник тримає в голові — тепер працює разом.',
    features: [
      ['Прямі покупці в ЄС', 'Пошук кінцевих покупців за культурою, обсягом, ціною, оплатою та логістикою.'],
      ['Фінансування', 'Підбір банків і програм, попередня перевірка умов та готовий пакет документів.'],
      ['Техніка онлайн', 'GPS-карта, маршрути, мотогодини, простої, геозони та нагадування про ТО.'],
      ['Команда і задачі', 'Ролі, строки, звіти, статуси та коротка AI-сводка роботи співробітників.'],
      ['Гранти без пропусків', 'Моніторинг програм ЄС і України, дедлайни та чернетки заявок.'],
      ['Контекст підприємства', 'Земля, культури, склади, фінанси й документи заповнюються один раз.'],
    ],
    buyersKicker: 'Більше маржі, менше посередників', buyersTitle: 'Виходьте безпосередньо на європейського покупця.',
    buyersText: 'CORE AGRO відсіює посередників, ранжує контакти за відповідністю та допомагає підготувати комерційну пропозицію.',
    buyerPoints: ['Культура, обсяг і цільова ціна', 'Передоплата та умови розрахунків', 'Власна логістика або самовивіз', 'Контакти й історія комунікації'],
    calcLabel: 'Ілюстративний розрахунок', calcRows: [['Обсяг партії', '700 т'], ['Різниця з посередником', '€30–45/т'], ['Можлива додаткова виручка', '€21 000–31 500']],
    calcNote: 'Приклад для оцінки на даних клієнта, не гарантія ціни або доходу.',
    financeKicker: 'Кредити та гранти', financeTitle: 'Фінансування, підготовлене під ваш профіль.',
    financeText: 'Система зіставляє потребу з доступними програмами, збирає відомі дані та готує заявку до вашого підтвердження.',
    financeCards: [['01', 'Скажіть суму і строк'], ['02', 'Отримайте релевантні програми'], ['03', 'Перевірте умови й документи'], ['04', 'Підтвердьте подання']],
    financeNote: 'CORE AGRO знаходить і готує. Рішення щодо кредиту чи гранту завжди приймає банк або фонд.',
    fleetKicker: 'Телематика в реальному часі', fleetTitle: 'Техніка виїжджає в поле. Дані — одразу до вас.',
    fleetText: 'Бачте місцезнаходження, маршрути, паливо, простої та мотогодини. Отримуйте сигнал, коли машина виходить за геозону або наближається ТО.',
    fleetStats: [['18.4 км', 'маршрут сьогодні'], ['7 год 12 хв', 'у роботі'], ['92%', 'ефективність'], ['18 м/г', 'до наступного ТО']],
    flowKicker: 'Старт без довгого впровадження', flowTitle: 'Один профіль. Чотири прості кроки.',
    flow: [['Заповніть профіль', 'Земля, культури, техніка, команда та документи.'], ['Поставте задачу словами', 'Так само просто, як написати повідомлення.'], ['Отримайте готовий результат', 'Контакти, варіанти, звіт або наступну дію.'], ['Підтвердьте', 'Ви контролюєте кожну відправку та рішення.']],
    pricingKicker: 'Прозорі річні тарифи', pricingTitle: 'Почніть із порядку. Зростайте до експорту й фінансування.',
    plans: [
      ['CORE BASIC', '$380', 'Для невеликого господарства', ['до 5 користувачів', 'AI-асистент керівника', 'Задачі й контроль команди', 'Звіти та сповіщення']],
      ['CORE BUSINESS', '$630', 'Для продажів і техніки', ['до 10 користувачів', 'Усе з BASIC', 'Прямі покупці в ЄС', 'До 20 одиниць техніки онлайн']],
      ['CORE MAX', '$870', 'Для розвитку й фінансування', ['до 15 користувачів', 'Усе з BUSINESS', 'Кредити та гранти', 'До 50 одиниць техніки онлайн']],
    ], perYear: '/ рік', popular: 'Найкращий вибір', choose: 'Обрати тариф',
    faqKicker: 'Коротко про важливе', faqTitle: 'Запитання перед стартом.',
    faqs: [
      ['Чи потрібно вчитися працювати в складній CRM?', 'Ні. Основний інтерфейс — звичайний діалог з AI. Профіль підприємства заповнюється один раз.'],
      ['Чи гарантує система кредит або грант?', 'Ні. CORE AGRO знаходить релевантні можливості та готує пакет. Фінальне рішення приймає банк або фонд.'],
      ['Чи може система сама відправляти заявки?', 'Так, після явного підтвердження користувача й лише там, де канал технічно та юридично це дозволяє.'],
      ['Які ролі можна додати?', 'Власник, керівник, менеджер, агроном, механік, бухгалтер/фінансист і користувач з обмеженими правами.'],
    ],
    ctaTitle: 'Ваше господарство. Під контролем AI.', ctaText: 'Покажемо CORE AGRO на вашій культурі, обсязі та задачі — за 15 хвилин.', ctaButton: 'Запросити персональне демо',
    footer: 'AI-асистент керівника агропідприємства.', rights: 'Усі права захищено.',
  },
  en: {
    nav: ['Platform', 'Capabilities', 'How it works', 'Pricing'], login: 'Sign in', demo: 'Request a demo', badge: 'AI platform for agribusiness', heroA: 'One core.', heroB: 'Your whole operation.',
    heroText: 'Sales, machinery, teams, finance and grants — in one AI assistant that already knows your business context.', try: 'Try CORE AGRO', watch: 'Explore capabilities', scroll: 'Scroll',
    stats: [['€100–600K', 'target financing range'], ['up to 50 units', 'tracked online in CORE MAX'], ['24/7', 'farm context available to AI'], ['2–5+ years', 'typical programme term']],
    introKicker: 'Not another complex system', introTitle: 'You write like you would to a person. CORE AGRO acts like a team.', introText: 'Tell it about your land, crops, machinery, people and finances once. The system remembers the context and returns a ready result — not generic advice.',
    chatLabel: 'Live scenario', prompts: ['Sell 700 t of sunflower for at least €440/t', 'Find €300,000 for 3 years', 'What is happening on the farm today?'], answers: [['12 direct EU buyers found', '7 offer prepayment', '4 provide their own logistics'], ['4 potential programmes found', 'Range — up to €350–500K', 'Draft document checklist ready'], ['2 tasks overdue', 'Tractor #7 is outside its geofence', 'Combine #3 needs service in 18 hours']], result: 'CORE AGRO analyses your company profile and prepares the next step.', confirm: 'Confirm action',
    featuresKicker: 'One digital operating layer', featuresTitle: 'Everything a manager keeps in their head — now working together.', features: [['Direct EU buyers', 'Find end buyers by crop, volume, price, payment and logistics.'], ['Financing', 'Match banks and programmes, pre-check terms and prepare documents.'], ['Machinery online', 'GPS map, routes, engine hours, idle time, geofences and maintenance.'], ['Teams and tasks', 'Roles, deadlines, reports, statuses and concise AI work summaries.'], ['Never miss a grant', 'Monitoring of EU and Ukrainian programmes, deadlines and draft applications.'], ['Company context', 'Land, crops, storage, finance and documents are entered once.']],
    buyersKicker: 'More margin, fewer middlemen', buyersTitle: 'Reach European buyers directly.', buyersText: 'CORE AGRO filters out intermediaries, ranks contacts by fit and helps prepare a commercial offer.', buyerPoints: ['Crop, volume and target price', 'Prepayment and payment terms', 'Own logistics or pickup', 'Contacts and communication history'], calcLabel: 'Illustrative calculation', calcRows: [['Shipment volume', '700 t'], ['Middleman difference', '€30–45/t'], ['Potential extra revenue', '€21,000–31,500']], calcNote: 'An example to calculate with the client’s data, not a price or income guarantee.',
    financeKicker: 'Loans and grants', financeTitle: 'Financing prepared for your profile.', financeText: 'The system matches your need with available programmes, gathers known data and prepares an application for your approval.', financeCards: [['01', 'State the amount and term'], ['02', 'See relevant programmes'], ['03', 'Review terms and documents'], ['04', 'Approve submission']], financeNote: 'CORE AGRO finds and prepares. The bank or fund always makes the final credit or grant decision.',
    fleetKicker: 'Real-time telematics', fleetTitle: 'Machinery goes to the field. Data comes straight to you.', fleetText: 'See location, routes, fuel, idle time and engine hours. Get alerts when a vehicle leaves its geofence or approaches maintenance.', fleetStats: [['18.4 km', 'route today'], ['7 h 12 min', 'working'], ['92%', 'efficiency'], ['18 h', 'until service']],
    flowKicker: 'Start without a long rollout', flowTitle: 'One profile. Four simple steps.', flow: [['Create your profile', 'Land, crops, machinery, team and documents.'], ['Ask in plain language', 'As simple as sending a message.'], ['Get a ready result', 'Contacts, options, a report or next action.'], ['Approve', 'You control every submission and decision.']],
    pricingKicker: 'Transparent annual pricing', pricingTitle: 'Start with control. Grow into exports and financing.', plans: [['CORE BASIC', '$380', 'For a small farm', ['up to 5 users', 'Management AI assistant', 'Team tasks and control', 'Reports and alerts']], ['CORE BUSINESS', '$630', 'For sales and machinery', ['up to 10 users', 'Everything in BASIC', 'Direct EU buyers', 'Up to 20 machines online']], ['CORE MAX', '$870', 'For growth and finance', ['up to 15 users', 'Everything in BUSINESS', 'Loans and grants', 'Up to 50 machines online']]], perYear: '/ year', popular: 'Best choice', choose: 'Choose plan',
    faqKicker: 'The essentials', faqTitle: 'Questions before you start.', faqs: [['Do I need to learn a complex CRM?', 'No. The main interface is a natural AI conversation. Your company profile is completed once.'], ['Does the system guarantee a loan or grant?', 'No. CORE AGRO finds relevant options and prepares the package. The bank or fund makes the final decision.'], ['Can it submit applications automatically?', 'Yes, after explicit user approval and only where the channel technically and legally allows it.'], ['Which roles can I add?', 'Owner, director, manager, agronomist, mechanic, accountant/finance and restricted user.']],
    ctaTitle: 'Your operation. Under AI control.', ctaText: 'See CORE AGRO work with your crop, volume and task — in 15 minutes.', ctaButton: 'Request a personal demo', footer: 'The AI assistant for agricultural management.', rights: 'All rights reserved.',
  },
  pl: {
    nav: ['Platforma', 'Możliwości', 'Jak to działa', 'Cennik'], login: 'Zaloguj się', demo: 'Umów demo', badge: 'Platforma AI dla agrobiznesu', heroA: 'Jeden rdzeń.', heroB: 'Całe gospodarstwo.', heroText: 'Sprzedaż, maszyny, zespół, finansowanie i dotacje — w jednym asystencie AI, który zna kontekst Twojej firmy.', try: 'Wypróbuj CORE AGRO', watch: 'Zobacz możliwości', scroll: 'Przewiń',
    stats: [['€100–600 tys.', 'docelowy zakres finansowania'], ['do 50 maszyn', 'online w CORE MAX'], ['24/7', 'kontekst gospodarstwa w AI'], ['2–5+ lat', 'orientacyjny okres programów']],
    introKicker: 'Nie kolejny trudny system', introTitle: 'Piszesz jak do człowieka. CORE AGRO działa jak zespół.', introText: 'Raz opisz ziemię, uprawy, maszyny, ludzi i finanse. System zapamięta kontekst i zwróci gotowy wynik — nie ogólną poradę.', chatLabel: 'Scenariusz na żywo', prompts: ['Sprzedaj 700 t słonecznika za min. €440/t', 'Znajdź €300 000 na 3 lata', 'Co dzieje się dziś w gospodarstwie?'], answers: [['Znaleziono 12 bezpośrednich kupców w UE', '7 oferuje przedpłatę', '4 ma własną logistykę'], ['Znaleziono 4 potencjalne programy', 'Zakres — do €350–500 tys.', 'Lista dokumentów jest gotowa'], ['2 zadania są po terminie', 'Ciągnik nr 7 poza geostrefą', 'Kombajn nr 3: serwis za 18 motogodzin']], result: 'CORE AGRO analizuje profil firmy i przygotowuje kolejny krok.', confirm: 'Potwierdź działanie',
    featuresKicker: 'Jeden cyfrowy obieg', featuresTitle: 'Wszystko, co menedżer trzyma w głowie — teraz działa razem.', features: [['Bezpośredni kupcy w UE', 'Wyszukiwanie odbiorców według uprawy, wolumenu, ceny, płatności i logistyki.'], ['Finansowanie', 'Dobór banków i programów, weryfikacja warunków i gotowy pakiet dokumentów.'], ['Maszyny online', 'Mapa GPS, trasy, motogodziny, postoje, geostrefy i serwis.'], ['Zespół i zadania', 'Role, terminy, raporty, statusy i zwięzłe podsumowania AI.'], ['Dotacje bez przeoczeń', 'Monitoring programów UE i Ukrainy, terminów i projektów wniosków.'], ['Kontekst firmy', 'Ziemia, uprawy, magazyny, finanse i dokumenty podajesz raz.']],
    buyersKicker: 'Więcej marży, mniej pośredników', buyersTitle: 'Docieraj bezpośrednio do europejskich kupców.', buyersText: 'CORE AGRO odfiltrowuje pośredników, szereguje kontakty i pomaga przygotować ofertę.', buyerPoints: ['Uprawa, wolumen i cena docelowa', 'Przedpłata i warunki płatności', 'Własna logistyka lub odbiór', 'Kontakty i historia komunikacji'], calcLabel: 'Przykładowa kalkulacja', calcRows: [['Wolumen partii', '700 t'], ['Różnica z pośrednikiem', '€30–45/t'], ['Potencjalny dodatkowy przychód', '€21 000–31 500']], calcNote: 'Przykład do obliczeń na danych klienta, nie gwarancja ceny ani przychodu.',
    financeKicker: 'Kredyty i dotacje', financeTitle: 'Finansowanie dopasowane do profilu.', financeText: 'System łączy potrzebę z dostępnymi programami, zbiera znane dane i przygotowuje wniosek do zatwierdzenia.', financeCards: [['01', 'Podaj kwotę i okres'], ['02', 'Zobacz odpowiednie programy'], ['03', 'Sprawdź warunki i dokumenty'], ['04', 'Zatwierdź wysłanie']], financeNote: 'CORE AGRO wyszukuje i przygotowuje. Ostateczną decyzję zawsze podejmuje bank lub fundusz.',
    fleetKicker: 'Telematyka w czasie rzeczywistym', fleetTitle: 'Maszyny ruszają w pole. Dane trafiają prosto do Ciebie.', fleetText: 'Lokalizacja, trasy, paliwo, postoje i motogodziny. Alerty o wyjeździe poza geostrefę i zbliżającym się serwisie.', fleetStats: [['18,4 km', 'dzisiejsza trasa'], ['7 h 12 min', 'w pracy'], ['92%', 'efektywność'], ['18 mth', 'do serwisu']],
    flowKicker: 'Start bez długiego wdrożenia', flowTitle: 'Jeden profil. Cztery proste kroki.', flow: [['Uzupełnij profil', 'Ziemia, uprawy, maszyny, zespół i dokumenty.'], ['Napisz zadanie', 'Tak prosto jak zwykła wiadomość.'], ['Odbierz gotowy wynik', 'Kontakty, warianty, raport lub kolejna czynność.'], ['Zatwierdź', 'Kontrolujesz każde wysłanie i decyzję.']],
    pricingKicker: 'Przejrzyste ceny roczne', pricingTitle: 'Zacznij od porządku. Rozwijaj eksport i finansowanie.', plans: [['CORE BASIC', '$380', 'Dla małego gospodarstwa', ['do 5 użytkowników', 'Asystent AI zarządu', 'Zadania i kontrola zespołu', 'Raporty i powiadomienia']], ['CORE BUSINESS', '$630', 'Dla sprzedaży i maszyn', ['do 10 użytkowników', 'Wszystko z BASIC', 'Bezpośredni kupcy w UE', 'Do 20 maszyn online']], ['CORE MAX', '$870', 'Dla rozwoju i finansowania', ['do 15 użytkowników', 'Wszystko z BUSINESS', 'Kredyty i dotacje', 'Do 50 maszyn online']]], perYear: '/ rok', popular: 'Najlepszy wybór', choose: 'Wybierz plan',
    faqKicker: 'Najważniejsze informacje', faqTitle: 'Pytania przed startem.', faqs: [['Czy muszę uczyć się skomplikowanego CRM?', 'Nie. Główny interfejs to naturalna rozmowa z AI. Profil firmy wypełniasz raz.'], ['Czy system gwarantuje kredyt lub dotację?', 'Nie. CORE AGRO wyszukuje opcje i przygotowuje pakiet. Decyzję podejmuje bank lub fundusz.'], ['Czy system może sam wysyłać wnioski?', 'Tak, po wyraźnej zgodzie użytkownika i tylko tam, gdzie jest to technicznie i prawnie możliwe.'], ['Jakie role mogę dodać?', 'Właściciel, dyrektor, menedżer, agronom, mechanik, księgowy/finanse i użytkownik ograniczony.']],
    ctaTitle: 'Twoje gospodarstwo. Pod kontrolą AI.', ctaText: 'Pokażemy CORE AGRO na Twojej uprawie, wolumenie i zadaniu — w 15 minut.', ctaButton: 'Umów indywidualne demo', footer: 'Asystent AI dla zarządzania rolnictwem.', rights: 'Wszelkie prawa zastrzeżone.',
  },
  kk: {
    nav: ['Платформа', 'Мүмкіндіктер', 'Қалай жұмыс істейді', 'Тарифтер'], login: 'Кіру', demo: 'Демо сұрау', badge: 'Агробизнеске арналған AI платформасы', heroA: 'Бір ядро.', heroB: 'Бүкіл шаруашылық.', heroText: 'Сату, техника, команда, қаржыландыру және гранттар — кәсіпорныңыздың контекстін білетін бір AI көмекшіде.', try: 'CORE AGRO-ны сынау', watch: 'Мүмкіндіктерді көру', scroll: 'Төмен жылжыңыз',
    stats: [['€100–600 мың', 'қаржыландырудың мақсатты ауқымы'], ['50 техникаға дейін', 'CORE MAX-та онлайн'], ['24/7', 'AI үшін шаруашылық контексті'], ['2–5+ жыл', 'бағдарламалардың шамамен мерзімі']],
    introKicker: 'Тағы бір күрделі жүйе емес', introTitle: 'Адамға жазғандай жазасыз. CORE AGRO команда сияқты әрекет етеді.', introText: 'Жер, дақыл, техника, адам және қаржы туралы бір рет айтыңыз. Жүйе контексті есте сақтап, жалпы кеңес емес, дайын нәтиже береді.', chatLabel: 'Тікелей сценарий', prompts: ['700 т күнбағысты кемінде €440/т бағамен сат', '3 жылға €300 000 тап', 'Бүгін шаруашылықта не болып жатыр?'], answers: [['ЕО-да 12 тікелей сатып алушы табылды', '7-еуі алдын ала төлем ұсынады', '4-еуінде өз логистикасы бар'], ['4 ықтимал бағдарлама табылды', 'Ауқымы — €350–500 мыңға дейін', 'Құжаттар тізімінің жобасы дайын'], ['2 тапсырма кешікті', '№7 трактор геоаймақтан тыс', '№3 комбайнға 18 мотосағаттан соң ТО']], result: 'CORE AGRO кәсіпорын профилін талдап, келесі қадамды дайындайды.', confirm: 'Әрекетті растау',
    featuresKicker: 'Бірыңғай цифрлық контур', featuresTitle: 'Басшының ойындағының бәрі енді бірге жұмыс істейді.', features: [['ЕО-дағы тікелей сатып алушылар', 'Дақыл, көлем, баға, төлем және логистика бойынша түпкі сатып алушыларды іздеу.'], ['Қаржыландыру', 'Банктер мен бағдарламаларды таңдау, шарттарды тексеру және құжаттар пакеті.'], ['Техника онлайн', 'GPS карта, маршруттар, мотосағат, тұрып қалу, геоаймақтар және ТО.'], ['Команда және тапсырмалар', 'Рөлдер, мерзімдер, есептер, мәртебелер және қысқа AI қорытындысы.'], ['Гранттарды жіберіп алмаңыз', 'ЕО мен Украина бағдарламаларын, мерзімдерін және өтінім жобаларын бақылау.'], ['Кәсіпорын контексті', 'Жер, дақыл, қойма, қаржы мен құжаттар бір рет енгізіледі.']],
    buyersKicker: 'Көбірек маржа, азырақ делдал', buyersTitle: 'Еуропалық сатып алушыға тікелей шығыңыз.', buyersText: 'CORE AGRO делдалдарды сүзеді, байланыстарды сәйкестігі бойынша сұрыптайды және ұсыныс дайындайды.', buyerPoints: ['Дақыл, көлем және мақсатты баға', 'Алдын ала төлем және төлем шарттары', 'Өз логистикасы немесе алып кету', 'Байланыстар және коммуникация тарихы'], calcLabel: 'Үлгілік есеп', calcRows: [['Партия көлемі', '700 т'], ['Делдалмен айырма', '€30–45/т'], ['Ықтимал қосымша түсім', '€21 000–31 500']], calcNote: 'Клиент деректерімен есептеуге арналған мысал, баға не табыс кепілдігі емес.',
    financeKicker: 'Несиелер мен гранттар', financeTitle: 'Профиліңізге сай дайындалған қаржыландыру.', financeText: 'Жүйе қажеттілікті бағдарламалармен салыстырып, белгілі деректерді жинайды және растауыңызға өтінім дайындайды.', financeCards: [['01', 'Сома мен мерзімді айтыңыз'], ['02', 'Сәйкес бағдарламаларды алыңыз'], ['03', 'Шарттар мен құжаттарды тексеріңіз'], ['04', 'Жіберуді растаңыз']], financeNote: 'CORE AGRO табады және дайындайды. Соңғы шешімді әрқашан банк немесе қор қабылдайды.',
    fleetKicker: 'Нақты уақыттағы телематика', fleetTitle: 'Техника егістікке шығады. Дерек бірден сізге келеді.', fleetText: 'Орналасу, маршрут, отын, бос тұру және мотосағат. Геоаймақтан шығу немесе ТО жақындағаны туралы белгі алыңыз.', fleetStats: [['18,4 км', 'бүгінгі маршрут'], ['7 сағ 12 мин', 'жұмыста'], ['92%', 'тиімділік'], ['18 м/с', 'ТО-ға дейін']],
    flowKicker: 'Ұзақ енгізусіз бастау', flowTitle: 'Бір профиль. Төрт қарапайым қадам.', flow: [['Профильді толтырыңыз', 'Жер, дақыл, техника, команда және құжаттар.'], ['Тапсырманы жазыңыз', 'Кәдімгі хабарлама сияқты оңай.'], ['Дайын нәтиже алыңыз', 'Байланыстар, нұсқалар, есеп немесе келесі әрекет.'], ['Растаңыз', 'Әр жіберу мен шешімді өзіңіз бақылайсыз.']],
    pricingKicker: 'Ашық жылдық тарифтер', pricingTitle: 'Тәртіптен бастаңыз. Экспорт пен қаржыландыруға дейін өсіңіз.', plans: [['CORE BASIC', '$380', 'Шағын шаруашылыққа', ['5 пайдаланушыға дейін', 'Басшының AI көмекшісі', 'Команда тапсырмалары', 'Есептер мен хабарламалар']], ['CORE BUSINESS', '$630', 'Сату мен техникаға', ['10 пайдаланушыға дейін', 'BASIC-тегі бәрі', 'ЕО-дағы тікелей сатып алушылар', '20 техникаға дейін онлайн']], ['CORE MAX', '$870', 'Өсу мен қаржыландыруға', ['15 пайдаланушыға дейін', 'BUSINESS-тегі бәрі', 'Несиелер мен гранттар', '50 техникаға дейін онлайн']]], perYear: '/ жыл', popular: 'Үздік таңдау', choose: 'Тарифті таңдау',
    faqKicker: 'Маңыздысы қысқаша', faqTitle: 'Бастамас бұрын сұрақтар.', faqs: [['Күрделі CRM үйрену керек пе?', 'Жоқ. Негізгі интерфейс — AI-мен табиғи диалог. Кәсіпорын профилі бір рет толтырылады.'], ['Жүйе несие немесе грантқа кепілдік бере ме?', 'Жоқ. CORE AGRO нұсқаларды тауып, пакетті дайындайды. Соңғы шешімді банк немесе қор қабылдайды.'], ['Өтінімді автоматты жібере ала ма?', 'Иә, пайдаланушының анық растауынан кейін және арна техникалық әрі заңды мүмкіндік бергенде ғана.'], ['Қандай рөлдер бар?', 'Иесі, басшы, менеджер, агроном, механик, бухгалтер/қаржыгер және шектеулі пайдаланушы.']],
    ctaTitle: 'Шаруашылығыңыз. AI бақылауында.', ctaText: 'CORE AGRO-ны дақылыңыз, көлеміңіз және тапсырмаңызбен 15 минутта көрсетеміз.', ctaButton: 'Жеке демо сұрау', footer: 'Агрокәсіпорын басшысының AI көмекшісі.', rights: 'Барлық құқық қорғалған.',
  },
  de: {
    nav: ['Plattform', 'Funktionen', 'So funktioniert es', 'Preise'], login: 'Anmelden', demo: 'Demo anfragen', badge: 'AI-Plattform für Agrarbetriebe', heroA: 'Ein Kern.', heroB: 'Der ganze Betrieb.', heroText: 'Verkauf, Maschinen, Team, Finanzierung und Fördermittel — in einem AI-Assistenten, der Ihren Betrieb bereits kennt.', try: 'CORE AGRO testen', watch: 'Funktionen entdecken', scroll: 'Scrollen',
    stats: [['€100–600 Tsd.', 'Zielrahmen der Finanzierung'], ['bis zu 50 Maschinen', 'online in CORE MAX'], ['24/7', 'Betriebskontext für die AI'], ['2–5+ Jahre', 'typische Programmlaufzeit']],
    introKicker: 'Kein weiteres komplexes System', introTitle: 'Sie schreiben wie einem Menschen. CORE AGRO handelt wie ein Team.', introText: 'Erfassen Sie Flächen, Kulturen, Maschinen, Menschen und Finanzen einmal. Das System merkt sich den Kontext und liefert ein fertiges Ergebnis statt allgemeiner Ratschläge.', chatLabel: 'Live-Szenario', prompts: ['Verkaufe 700 t Sonnenblumen für mindestens €440/t', 'Finde €300.000 für 3 Jahre', 'Was passiert heute im Betrieb?'], answers: [['12 direkte EU-Käufer gefunden', '7 bieten Vorauszahlung', '4 haben eigene Logistik'], ['4 potenzielle Programme gefunden', 'Rahmen — bis €350–500 Tsd.', 'Dokumenten-Checkliste vorbereitet'], ['2 Aufgaben überfällig', 'Traktor Nr. 7 außerhalb der Geozone', 'Mähdrescher Nr. 3: Wartung in 18 Std.']], result: 'CORE AGRO analysiert Ihr Unternehmensprofil und bereitet den nächsten Schritt vor.', confirm: 'Aktion bestätigen',
    featuresKicker: 'Eine digitale Steuerungsebene', featuresTitle: 'Alles, was die Betriebsleitung im Kopf behält — arbeitet jetzt zusammen.', features: [['Direkte EU-Käufer', 'Endabnehmer nach Kultur, Menge, Preis, Zahlung und Logistik finden.'], ['Finanzierung', 'Banken und Programme abgleichen, Konditionen prüfen und Unterlagen vorbereiten.'], ['Maschinen online', 'GPS-Karte, Routen, Betriebsstunden, Stillstand, Geozonen und Wartung.'], ['Team und Aufgaben', 'Rollen, Fristen, Berichte, Status und kompakte AI-Zusammenfassungen.'], ['Keine Förderung verpassen', 'Monitoring von EU- und Ukraine-Programmen, Fristen und Antragsentwürfen.'], ['Betriebskontext', 'Flächen, Kulturen, Lager, Finanzen und Dokumente werden einmal erfasst.']],
    buyersKicker: 'Mehr Marge, weniger Zwischenhandel', buyersTitle: 'Erreichen Sie europäische Käufer direkt.', buyersText: 'CORE AGRO filtert Zwischenhändler, priorisiert passende Kontakte und hilft bei der Angebotserstellung.', buyerPoints: ['Kultur, Menge und Zielpreis', 'Vorauszahlung und Zahlungsbedingungen', 'Eigene Logistik oder Abholung', 'Kontakte und Kommunikationsverlauf'], calcLabel: 'Beispielrechnung', calcRows: [['Partievolumen', '700 t'], ['Differenz zum Zwischenhandel', '€30–45/t'], ['Möglicher Mehrerlös', '€21.000–31.500']], calcNote: 'Beispiel zur Berechnung mit Kundendaten, keine Preis- oder Ertragsgarantie.',
    financeKicker: 'Kredite und Fördermittel', financeTitle: 'Finanzierung, passend zu Ihrem Profil.', financeText: 'Das System gleicht Ihren Bedarf mit Programmen ab, sammelt bekannte Daten und bereitet einen Antrag zur Freigabe vor.', financeCards: [['01', 'Betrag und Laufzeit nennen'], ['02', 'Passende Programme erhalten'], ['03', 'Konditionen und Unterlagen prüfen'], ['04', 'Einreichung freigeben']], financeNote: 'CORE AGRO findet und bereitet vor. Die endgültige Kredit- oder Förderentscheidung trifft immer die Bank oder der Fonds.',
    fleetKicker: 'Telematik in Echtzeit', fleetTitle: 'Die Maschine fährt aufs Feld. Die Daten kommen direkt zu Ihnen.', fleetText: 'Standort, Routen, Kraftstoff, Stillstand und Betriebsstunden. Warnungen bei Verlassen der Geozone oder anstehender Wartung.', fleetStats: [['18,4 km', 'Route heute'], ['7 Std. 12 Min.', 'im Einsatz'], ['92%', 'Effizienz'], ['18 Std.', 'bis zur Wartung']],
    flowKicker: 'Start ohne langes Rollout', flowTitle: 'Ein Profil. Vier einfache Schritte.', flow: [['Profil ausfüllen', 'Flächen, Kulturen, Maschinen, Team und Dokumente.'], ['Aufgabe normal formulieren', 'So einfach wie eine Nachricht.'], ['Fertiges Ergebnis erhalten', 'Kontakte, Optionen, Bericht oder nächste Aktion.'], ['Freigeben', 'Sie kontrollieren jede Einreichung und Entscheidung.']],
    pricingKicker: 'Transparente Jahrespreise', pricingTitle: 'Mit Kontrolle starten. Zu Export und Finanzierung wachsen.', plans: [['CORE BASIC', '$380', 'Für kleinere Betriebe', ['bis zu 5 Nutzer', 'AI-Assistent der Leitung', 'Teamaufgaben und Kontrolle', 'Berichte und Hinweise']], ['CORE BUSINESS', '$630', 'Für Verkauf und Maschinen', ['bis zu 10 Nutzer', 'Alles aus BASIC', 'Direkte EU-Käufer', 'Bis zu 20 Maschinen online']], ['CORE MAX', '$870', 'Für Wachstum und Finanzierung', ['bis zu 15 Nutzer', 'Alles aus BUSINESS', 'Kredite und Fördermittel', 'Bis zu 50 Maschinen online']]], perYear: '/ Jahr', popular: 'Beste Wahl', choose: 'Tarif wählen',
    faqKicker: 'Das Wichtigste', faqTitle: 'Fragen vor dem Start.', faqs: [['Muss ich ein komplexes CRM lernen?', 'Nein. Die Hauptoberfläche ist ein natürlicher AI-Dialog. Das Unternehmensprofil wird einmal ausgefüllt.'], ['Garantiert das System Kredit oder Förderung?', 'Nein. CORE AGRO findet passende Optionen und bereitet das Paket vor. Bank oder Fonds entscheiden final.'], ['Kann es Anträge automatisch einreichen?', 'Ja, nach ausdrücklicher Nutzerfreigabe und nur, wenn der Kanal dies technisch und rechtlich erlaubt.'], ['Welche Rollen gibt es?', 'Eigentümer, Leitung, Manager, Agronom, Mechaniker, Buchhaltung/Finanzen und eingeschränkte Nutzer.']],
    ctaTitle: 'Ihr Betrieb. Unter AI-Kontrolle.', ctaText: 'Wir zeigen CORE AGRO mit Ihrer Kultur, Menge und Aufgabe — in 15 Minuten.', ctaButton: 'Persönliche Demo anfragen', footer: 'Der AI-Assistent für die Agrarbetriebsleitung.', rights: 'Alle Rechte vorbehalten.',
  },
};

const featureIcons = [Globe2, Banknote, Tractor, Users, Sparkles, FileCheck2];
const fleetIcons = [Route, Fuel, BarChart3, Zap];

function Reveal({ children, className = '', direction = 'up', delay = 0 }: { children: ReactNode; className?: string; direction?: 'up' | 'left' | 'right'; delay?: number }) {
  return <div className={`reveal reveal-${direction} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function Kicker({ children }: { children: ReactNode }) {
  return <div className="section-kicker mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[.22em] text-[#b8ee37]"><span className="h-px w-8 bg-[#b8ee37]" />{children}</div>;
}

export default function Home() {
  const [locale, setLocale] = useState<Locale>('uk');
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const t = copy[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem('core-agro-locale') as Locale | null;
    if (saved && saved in languages) setLocale(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('core-agro-locale', locale);
    document.documentElement.lang = locale;
    setDemoIndex(0);
  }, [locale]);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.reveal, [data-scene]');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((target) => target.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, []);

  const changeLocale = (value: string) => setLocale(value as Locale);

  return (
    <main className="overflow-hidden bg-[#061009] text-[#f5f8f3]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/8 bg-[#061009]/75 backdrop-blur-2xl">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 lg:px-10">
          <a className="brand flex items-center gap-3 font-semibold tracking-[0.16em]" href="#top" aria-label="CORE AGRO">
            <span className="logo-mark"><Leaf size={18} /></span> CORE·AGRO
          </a>
          <nav className="hidden items-center gap-7 text-sm text-white/62 lg:flex">
            {['product', 'features', 'process', 'pricing'].map((id, i) => <a key={id} href={id === 'pricing' ? '/pricing' : `#${id}`}>{t.nav[i]}</a>)}
          </nav>
          <div className="flex items-center gap-2">
            <label className="language-select">
              <span className="sr-only">Language</span>
              <Globe2 className="language-icon" aria-hidden="true" />
              <select value={locale} onChange={(e) => changeLocale(e.target.value)} aria-label="Language">
                {Object.entries(languages).map(([code, lang]) => <option key={code} value={code}>{lang.name}</option>)}
              </select>
              <ChevronDown className="language-chevron" aria-hidden="true" />
            </label>
            <a href="#demo" className="nav-demo hidden sm:inline-flex">{t.demo}<ArrowUpRight size={15} /></a>
            <button className="menu-button lg:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" aria-expanded={menuOpen}>{menuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
        {menuOpen && <nav className="mobile-nav lg:hidden">{['product', 'features', 'process', 'pricing'].map((id, i) => <a key={id} href={id === 'pricing' ? '/pricing' : `#${id}`} onClick={() => setMenuOpen(false)}>{t.nav[i]}<ArrowRight size={16} /></a>)}</nav>}
      </header>

      <section id="top" className="hero-section relative min-h-[920px] overflow-hidden">
        <div className="hero-scene absolute inset-0" aria-hidden="true">
          <div className="hero-backdrop absolute inset-0" />
          <div className="hero-shade absolute inset-0" />
          <div className="field-grid absolute inset-x-0 bottom-0 h-[72%]" />
          <div className="hero-artboard">
            <div className="tractor-entry"><img src="/hero-tractor-v2.webp" alt="" width="1300" height="650" fetchPriority="high" decoding="async" /></div>
            <div className="scan-system">
              <div className="scan-cone"><span className="scan-plane" /><span className="scan-ray ray-one" /><span className="scan-ray ray-two" /><span className="scan-ray ray-three" /></div>
              <div className="scan-target"><span /><span /><span /></div>
            </div>
            <div className="drone-entry"><img className="hero-drone" src="/hero-drone-v2.webp" alt="" width="720" height="480" fetchPriority="high" decoding="async" /></div>
            <div className="hero-signal signal-one"><span>NDVI</span><strong>0.84</strong><small>+12%</small></div>
            <div className="hero-signal signal-two"><span>Yield forecast</span><strong>6.8 t/ha</strong><svg viewBox="0 0 120 30"><path d="M2 25 C20 24 30 18 42 20 S64 14 74 16 S95 3 118 6" /></svg></div>
          </div>
        </div>
        <div className="hero-stage relative z-10 mx-auto flex min-h-[920px] max-w-[1440px] items-center px-5 pb-36 pt-36 lg:px-10">
          <div className="hero-copy-block max-w-[830px]">
            <div className="hero-badge"><Radar size={15} /> {t.badge}</div>
            <h1 className="hero-title">{t.heroA}<br /><span>{t.heroB}</span></h1>
            <p className="hero-copy">{t.heroText}</p>
            <div className="mt-10 flex flex-wrap gap-3">
              <a href="#demo" className="primary-button">{t.try}<ArrowUpRight size={18} /></a>
              <a href="#product" className="secondary-button"><Play size={17} />{t.watch}</a>
            </div>
          </div>
        </div>
        <div className="scroll-cue">{t.scroll}<span /></div>
      </section>

      <section className="stats-bar relative z-20 mx-auto -mt-20 grid max-w-[1360px] md:grid-cols-4">
        {t.stats.map(([value, label], i) => <div className="stat-cell" key={value}><span>0{i + 1}</span><strong>{value}</strong><p>{label}</p></div>)}
      </section>

      <section id="product" className="section-shell pt-36 md:pt-52">
        <div className="grid gap-14 lg:grid-cols-[.9fr_1.1fr] lg:items-start">
          <Reveal direction="left"><Kicker>{t.introKicker}</Kicker><h2 className="section-title">{t.introTitle}</h2><p className="section-copy">{t.introText}</p></Reveal>
          <Reveal direction="right" delay={120}>
            <div id="demo" className="chat-panel">
              <div className="chat-top"><div className="flex items-center gap-3"><span className="logo-mark small"><Bot size={15} /></span><div><strong>CORE AGRO</strong><small>{t.chatLabel}</small></div></div><span className="live-dot">LIVE</span></div>
              <div className="prompt-tabs">{t.prompts.map((prompt, i) => <button key={prompt} className={i === demoIndex ? 'active' : ''} onClick={() => setDemoIndex(i)}>{prompt}</button>)}</div>
              <div className="chat-message user-message">{t.prompts[demoIndex]}</div>
              <div className="chat-message ai-message"><div className="ai-line"><Sparkles size={16} />{t.result}</div>{t.answers[demoIndex].map((answer) => <div className="answer-line" key={answer}><Check size={15} />{answer}</div>)}<button className="confirm-button">{t.confirm}<ArrowRight size={15} /></button></div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="features" className="section-shell pt-36 md:pt-52">
        <Reveal><Kicker>{t.featuresKicker}</Kicker><h2 className="section-title max-w-4xl">{t.featuresTitle}</h2></Reveal>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
          {t.features.map(([title, text], i) => { const Icon = featureIcons[i]; return <Reveal key={title} delay={(i % 3) * 80}><article className="feature-card"><div className="feature-icon"><Icon /></div><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p><ArrowUpRight className="card-arrow" size={20} /></article></Reveal>; })}
        </div>
      </section>

      <section className="ticker" aria-hidden="true"><div>{['EU BUYERS', 'FIELD DATA', 'MACHINERY', 'FINANCING', 'GRANTS', 'TEAM CONTROL', 'EU BUYERS', 'FIELD DATA', 'MACHINERY', 'FINANCING'].map((word, i) => <span key={`${word}-${i}`}>{word}<Sprout /></span>)}</div></section>

      <section className="section-shell media-section py-36 md:py-52" data-scene>
        <div className="media-visual media-buyers scene-visual" aria-hidden="true"><picture><source media="(max-width: 699px)" srcSet="/buyers-eu-mobile-v2.webp" /><img src="/buyers-eu-v2.webp" alt="" width="1200" height="800" loading="lazy" decoding="async" /></picture><div className="visual-overlay" /><div className="map-orbit orbit-a" /><div className="map-orbit orbit-b" /><span className="map-node n1" /><span className="map-node n2" /><span className="map-node n3" /></div>
        <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_.85fr] lg:items-center">
          <Reveal direction="left"><Kicker>{t.buyersKicker}</Kicker><h2 className="section-title max-w-3xl">{t.buyersTitle}</h2><p className="section-copy max-w-2xl">{t.buyersText}</p><div className="check-grid">{t.buyerPoints.map((point) => <div key={point}><Check size={16} />{point}</div>)}</div></Reveal>
          <Reveal direction="right" delay={100}><div className="calc-card"><div className="calc-head"><CircleDollarSign />{t.calcLabel}</div>{t.calcRows.map(([label, value], i) => <div className={`calc-row ${i === 2 ? 'total' : ''}`} key={label}><span>{label}</span><strong>{value}</strong></div>)}<p>{t.calcNote}</p></div></Reveal>
        </div>
      </section>

      <section className="finance-section relative overflow-hidden py-36 md:py-52" data-scene>
        <div className="finance-media scene-visual" aria-hidden="true"><picture><source media="(max-width: 699px)" srcSet="/finance-mobile-v2.webp" /><img src="/finance-v2.webp" alt="" width="1200" height="800" loading="lazy" decoding="async" /></picture><div className="finance-image-shade" /></div>
        <div className="finance-glow" />
        <div className="section-shell relative z-10">
          <Reveal><Kicker>{t.financeKicker}</Kicker><h2 className="section-title max-w-4xl">{t.financeTitle}</h2><p className="section-copy max-w-2xl">{t.financeText}</p></Reveal>
          <div className="finance-flow mt-16">{t.financeCards.map(([num, label], i) => <Reveal key={num} delay={i * 90}><article><span>{num}</span><div className="flow-orb">{i === 0 ? <Banknote /> : i === 1 ? <Globe2 /> : i === 2 ? <FileCheck2 /> : <ShieldCheck />}</div><h3>{label}</h3>{i < 3 && <ArrowRight className="flow-arrow" />}</article></Reveal>)}</div>
          <Reveal delay={180}><div className="finance-note"><ShieldCheck /><p>{t.financeNote}</p></div></Reveal>
        </div>
      </section>

      <section className="fleet-section relative min-h-[900px] overflow-hidden py-36 md:py-52" data-scene>
        <div className="fleet-image scene-visual absolute inset-0" aria-hidden="true"><picture><source media="(max-width: 699px)" srcSet="/fleet-mobile-v2.webp" /><img src="/fleet-v2.webp" alt="" width="1600" height="900" loading="lazy" decoding="async" /></picture></div>
        <div className="fleet-shade absolute inset-0" />
        <div className="section-shell relative z-10">
          <Reveal direction="left"><Kicker>{t.fleetKicker}</Kicker><h2 className="section-title max-w-4xl">{t.fleetTitle}</h2><p className="section-copy max-w-2xl">{t.fleetText}</p></Reveal>
          <div className="fleet-dashboard mt-20 grid gap-3 sm:grid-cols-2 lg:ml-auto lg:w-[64%] lg:grid-cols-4">{t.fleetStats.map(([value, label], i) => { const Icon = fleetIcons[i]; return <Reveal key={value} delay={i * 75}><article><Icon /><strong>{value}</strong><span>{label}</span></article></Reveal>; })}</div>
        </div>
        <div className="machine-track"><span className="track-dot d1" /><span className="track-dot d2" /><span className="track-dot d3" /></div>
      </section>

      <section id="process" className="section-shell py-36 md:py-52">
        <Reveal><Kicker>{t.flowKicker}</Kicker><h2 className="section-title max-w-4xl">{t.flowTitle}</h2></Reveal>
        <div className="process-grid mt-16">{t.flow.map(([title, text], i) => <Reveal key={title} delay={i * 90}><article><span className="process-num">0{i + 1}</span><div className="process-line" /><h3>{title}</h3><p>{text}</p></article></Reveal>)}</div>
      </section>

      <section id="pricing" className="pricing-section py-36 md:py-52">
        <div className="section-shell">
          <Reveal><Kicker>{t.pricingKicker}</Kicker><h2 className="section-title max-w-5xl">{t.pricingTitle}</h2></Reveal>
          <div className="pricing-grid mt-16">{t.plans.map(([name, price, desc, features], i) => <Reveal key={name as string} delay={i * 90}><article className={`price-card ${i === 1 ? 'featured' : ''}`}>{i === 1 && <div className="popular"><Sparkles size={13} />{t.popular}</div>}<span className="plan-index">0{i + 1}</span><h3>{name as string}</h3><p>{desc as string}</p><div className="price"><strong>{price as string}</strong><span>{t.perYear}</span></div><div className="plan-features">{(features as string[]).map((feature) => <div key={feature}><Check />{feature}</div>)}</div><a className={i === 1 ? 'primary-button' : 'secondary-button'} href="/pricing">{t.choose}<ArrowRight size={16} /></a></article></Reveal>)}</div>
        </div>
      </section>

      <section className="section-shell py-36 md:py-52">
        <div className="grid gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <Reveal direction="left"><Kicker>{t.faqKicker}</Kicker><h2 className="section-title">{t.faqTitle}</h2></Reveal>
          <div className="faq-list">{t.faqs.map(([question, answer], i) => <Reveal key={question} delay={i * 60}><article className={openFaq === i ? 'open' : ''}><button onClick={() => setOpenFaq(openFaq === i ? -1 : i)} aria-expanded={openFaq === i}><span>{question}</span><span className="faq-plus" aria-hidden="true"><Plus /></span></button><div className="faq-answer"><p>{answer}</p></div></article></Reveal>)}</div>
        </div>
      </section>

      <section className="section-shell pb-10">
        <Reveal><div className="final-cta"><div className="cta-grid" /><div className="cta-content"><div className="logo-mark large"><Wheat /></div><h2>{t.ctaTitle}</h2><p>{t.ctaText}</p><a href="mailto:hello@core-agro.ai" className="primary-button">{t.ctaButton}<ArrowUpRight size={18} /></a></div><div className="cta-orbit" /></div></Reveal>
      </section>

      <footer className="section-shell footer">
        <div className="brand flex items-center gap-3 font-semibold tracking-[0.16em]"><span className="logo-mark"><Leaf size={18} /></span> CORE·AGRO</div>
        <p>{t.footer}</p>
        <div className="footer-meta">
          <nav className="footer-links" aria-label="Legal">
            <a href="/project-declaration">Декларация проекта</a>
            <a href="/risk-disclosure">Уведомление о рисках</a>
          </nav>
          <p>© 2026 CORE AGRO. {t.rights}</p>
        </div>
      </footer>
    </main>
  );
}
