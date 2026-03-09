# Ant Design Next Starter

This project has been migrated from `@umijs/max` to `Next.js 16.1.6` with `TypeScript 5.9.3` and `Ant Design 6.3.1`.

## Author

- Name: `Nguyen Dong Phuong`
- Email: `phuongnd468@gmail.com`
- GitHub: `https://github.com/phuongnd468-svg/Dashboard-Admin-Pro`

## What changed

- Replaced the Umi/Max runtime with the Next.js App Router.
- Expanded localization to three maintained locales:
  - Primary: `en-US`
  - Secondary: `vi-VN`
  - Additional: `ja-JP`
- Removed the old multi-locale Umi setup and rebuilt the demo screens on top of modern Ant Design components.

## Routes

- `/en-US/welcome`
- `/en-US/admin`
- `/en-US/list`
- `/en-US/user/login`
- `/vi-VN/welcome`
- `/vi-VN/admin`
- `/vi-VN/list`
- `/vi-VN/user/login`
- `/ja-JP/welcome`
- `/ja-JP/admin`
- `/ja-JP/list`
- `/ja-JP/user/login`

## Development

```bash
yarn install
yarn dev
```

## Environment

The app uses `NEXT_PUBLIC_API_BASE_URL` as the single API entry point.

```bash
NEXT_PUBLIC_API_BASE_URL=/api
```

Current default:
- `.env` points to the built-in mock server powered by Next.js route handlers and JSON files in `src/data`

When a real backend is ready:
- update `NEXT_PUBLIC_API_BASE_URL` in `.env`
- keep the same UI hooks/services layer
- no screen-level fetch logic needs to change

## API Layer

The frontend no longer calls `fetch('/api/...')` directly from screens.

It now uses:
- `src/lib/api/client.ts` for HTTP requests, timeouts, and error normalization
- `src/lib/api/hooks.ts` for query/mutation hooks
- `src/lib/api/*.ts` for resource services such as categories, products, orders, monitor, and workplace

## Demo login

- Admin: `admin / ant.design`
- Member: `user / ant.design`
