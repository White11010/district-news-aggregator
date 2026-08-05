# Новости районов СПб (для SMM)

Внутренняя страница для отбора районных новостей за 1–3 дня. Деплой: GitHub Pages.

## Стек

Vue 3 · Vite · TypeScript · Pinia · Vue Router · Naive UI

## Локально

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## GitHub Pages

После пуша в `main` workflow собирает и публикует сайт.

URL: `https://white11010.github.io/district-news-aggregator/`

В настройках репозитория: **Settings → Pages → Source → GitHub Actions**.

## API

- Районы: `https://yazzh.gate.petersburg.ru/news/districts/`
- Новости: `https://yazzh.gate.petersburg.ru/news/districts_period/`

Результаты кэшируются в `sessionStorage` на 10 минут (с учётом фильтров и страницы).
