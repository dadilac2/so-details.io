## Цель
Добавить аналитику (Яндекс Метрика с целями), SEO-микроразметку Schema.org для туров и подготовить карточки/страницы туров под рекламные фиды.

## 1. Яндекс Метрика

**Где:** `src/routes/__root.tsx` — добавить счётчик в `head()` через `scripts` и `<noscript>`-фоллбэк в `<body>` (помним: `<img>` в `<noscript>` нельзя в `<head>`, только в `<body>`).

- Номер счётчика — константа `YM_ID = "XXXXXXXX"` в новом файле `src/lib/analytics.ts`.
- Туда же — типобезопасный хелпер `ymGoal(name: string)`, который вызывает `window.ym(YM_ID, "reachGoal", name)` с проверкой существования `window.ym` (для SSR).

**Цели:**
- `SUBMIT_FORM` — в `TourModal.tsx`, в `submit()` после успешного `result.ok` (засчитываем именно успешные отправки; если важно ловить любое нажатие — продублировать на onClick кнопки).
- `CLICK_PHONE` — `onClick` на `<a href="tel:...">` в `TourModal.tsx` и в `SiteFooter.tsx` (если телефон станет кликабельным).
- `CLICK_TELEGRAM` — `onClick` на ссылках Telegram в `TourModal.tsx` и `SiteFooter.tsx`.
- `CLICK_WHATSAPP` — `onClick` на ссылках WhatsApp в тех же файлах.

## 2. Schema.org для туров

**Где:** новый компонент `src/components/TourJsonLd.tsx`, рендерится на главной для каждого тура (внутри `Index` после списка карточек).

- Тип: `Product` с `offers.Offer` (надёжная поддержка Яндекс/Google).
- Поля: `name`, `description`, `image` (абсолютный URL), `url` (`https://<origin>/#tour-<id>`), `offers`: `price`, `priceCurrency: "RUB"`, `availability: "https://schema.org/InStock"`.
- Рендер через `<script type="application/ld+json">` с `dangerouslySetInnerHTML`. Origin берём из `window.location.origin` на клиенте; на сервере — пустая строка (Я.Вебмастер пере-парсит после гидрации, для надёжности можно завести `SITE_URL` константу).

## 3. Подготовка к рекламным фидам

**`TourCard.tsx`:**
- Добавить на корневой `<button>` data-атрибуты: `data-tour-id`, `data-tour-name`, `data-tour-price`, `data-tour-url`, `data-tour-image`.
- Добавить `id={`tour-${tour.id}`}` — это даёт якорную ссылку на карточку тура.

**Отдельная «страница» тура:**
- Реализуем через query-параметр `?tour=<id>` на главной: при наличии — открываем `TourModal` автоматически. Это даёт стабильный URL `/?tour=hermitage` для рекламы и SEO без создания N route-файлов.
- В `TourModal` при открытии обновлять URL (`history.replaceState`), при закрытии — убирать параметр.
- Альтернатива (если нужен «настоящий» URL): создать `src/routes/tours.$tourId.tsx` с полноценной страницей и собственным `head()` (title/description/og:image из данных тура). **Рекомендую этот вариант** — он лучше для SEO и рекламы (отдельный landing на каждый тур, корректный og:image, выделенный URL в фиде).

## Технические детали

- Загрузка ym-скрипта — асинхронная, через `scripts: [{ children: "..." }]` в root `head()` либо `<ScriptOnce>`. Используем стандартный сниппет Яндекса с `defer`.
- Все `window.*` обращения — за `typeof window !== "undefined"`.
- В `TourModal` обработчики кликов — стрелки, не блокируют переход (`tel:`, `https://`).

## Вопрос для подтверждения
Делать отдельные route-страницы туров (`/tours/<id>`) — это дольше, но даёт полноценные SEO-страницы с уникальным title/description/og:image на каждый тур, что обычно нужно для рекламы. Или ограничиться открытием модалки по `?tour=<id>` на главной?
