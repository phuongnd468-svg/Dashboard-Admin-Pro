# Admin Pro

Modern admin dashboard template built with `Next.js 16`, `React 19`, `TypeScript 5.9`, and `Ant Design 6`.

It includes a professional dashboard shell, theme customization, multi-language support, mock server APIs backed by local JSON files, and a growing set of management modules such as categories, products, orders, users, permissions, monitor, workplace, forms, and UI component showcases.

![Admin Pro Preview](./public/readme-cover.svg)

## Highlights

- Next.js App Router architecture
- Ant Design 6 UI system
- TypeScript-first codebase
- Mock server API powered by Next.js route handlers
- JSON-backed data layer for local development
- Reusable API client and hooks layer
- Theme settings persisted in `localStorage`
- Multi-language UI:
  - `en-US`
  - `vi-VN`
  - `ja-JP`
- Professional admin layout:
  - collapsible sidebar
  - theme-aware active states
  - settings drawer
  - responsive header and footer
- Ready-made pages:
  - Dashboard Analysis
  - Monitor
  - Workplace
  - Form templates
  - Components gallery
  - Categories CRUD
  - Products CRUD
  - Orders CRUD
  - Users CRUD
  - Permissions CRUD
  - Rule management

## Preview

The template is designed as a realistic operations dashboard instead of a basic starter:

- polished sidebar and navigation behavior
- professional settings panel with persistent UI preferences
- dynamic monitor screen with live-like metrics
- business-oriented management screens using Ant Design patterns
- mock API architecture that can be swapped for a real backend later

## Tech Stack

### Core

- `Next.js 16.1.6`
- `React 19.2.4`
- `React DOM 19.2.4`
- `TypeScript 5.9.3`

### UI

- `Ant Design 6.3.1`
- `@ant-design/icons`
- `@ant-design/nextjs-registry`
- `@ant-design/cssinjs`
- `antd-style`

### Utilities

- `dayjs`
- `clsx`

### Tooling

- `Yarn 1.22.22`
- `Biome`
- `Husky`
- `lint-staged`
- `commitlint`

## Project Structure

```text
src/
  app/
    [locale]/               localized routes
    api/                    mock server API routes
  components/
    layout/                 app shell and dashboard layout
    providers/              app-level providers
    screens/                page-level UI screens
  data/                     local JSON data sources
  lib/
    api/                    API client, hooks, and resource services
    *.ts                    data read/write helpers
```

## Included Pages

### Dashboard

- `/[locale]/welcome`
- `/[locale]/monitor`
- `/[locale]/workplace`

### Business Management

- `/[locale]/categories`
- `/[locale]/products`
- `/[locale]/orders`
- `/[locale]/users`
- `/[locale]/permissions`
- `/[locale]/list`

### Configuration and Showcase

- `/[locale]/admin`
- `/[locale]/form`
- `/[locale]/components`
- `/[locale]/user/login`

Examples:

- `/en-US/welcome`
- `/vi-VN/products`
- `/ja-JP/monitor`

## Installation

### Requirements

- `Node.js >= 20`
- `Yarn 1.x`

### 1. Install dependencies

```bash
yarn install
```

### 2. Configure environment

Create your local environment file if needed:

```bash
cp .env.example .env
```

Current environment strategy:

```env
NEXT_PUBLIC_API_BASE_URL=/api
```

By default, the app uses the built-in mock server exposed through Next.js route handlers.

### 3. Start development server

```bash
yarn dev
```

Open:

```text
http://localhost:3000
```

### 4. Production build

```bash
yarn build
yarn start
```

## Available Scripts

```bash
yarn dev
yarn build
yarn start
yarn tsc
yarn lint
```

### What they do

- `yarn dev`: run local development server
- `yarn build`: create production build
- `yarn start`: run built app
- `yarn tsc`: run TypeScript type-check
- `yarn lint`: run Biome lint + TypeScript check

## Mock API Architecture

This template does not call `fetch('/api/...')` directly inside screens.

Instead, it uses a cleaner layered structure:

- `src/lib/api/client.ts`
  - request helper
  - error normalization
  - shared API behavior
- `src/lib/api/hooks.ts`
  - reusable query and mutation hooks
- `src/lib/api/*.ts`
  - resource-specific API services
- `src/app/api/**`
  - mock server endpoints
- `src/data/*.json`
  - local persistent mock data

This makes the project closer to a real production structure.

When your real backend is ready, you can usually keep the UI layer unchanged and only update:

```env
NEXT_PUBLIC_API_BASE_URL=YOUR_REAL_API_BASE_URL
```

## Localization

Supported locales:

- `en-US`
- `vi-VN`
- `ja-JP`

Language can be switched from:

- header language selector
- sidebar language selector
- login page selector

## UI Features

### Layout

- collapsible sidebar
- theme-aware active menu states
- mini-sidebar tooltip and popup submenu behavior
- responsive header with language, notifications, and user area
- settings drawer for theme and layout control

### Settings Persistence

The shell stores UI settings in `localStorage`, including:

- theme color
- collapsed sidebar state
- fixed header
- fixed sidebar
- show/hide header
- show/hide footer
- content width
- dark/light page style

## Demo Authentication

Demo credentials:

- Admin: `admin / ant.design`
- Member: `user / ant.design`

## Notes for Real Backend Integration

If you want to replace the mock API with a real server:

1. Keep current screens and hooks
2. Update `NEXT_PUBLIC_API_BASE_URL`
3. Adjust `src/lib/api/*.ts` if response shape differs
4. Remove or keep `src/app/api/**` as local fallback

## Author

- Name: `Nguyen Dong Phuong`
- Email: `phuongnd468@gmail.com`
- GitHub: `https://github.com/phuongnd468-svg/Dashboard-Admin-Pro`

## License

MIT License  
Copyright (c) `2026-present` `DP Digital`
