# KSI Web frontend (Next.js)

Frontend for the [KSI backend](https://github.com/fi-ksi/web-backend), rewritten in
[Next.js](https://nextjs.org/) (React 18 + TypeScript). This replaces the previous
Angular implementation on this branch.

## Running

```bash
git clone https://github.com/fi-ksi/web-frontend-angular.git
cd web-frontend-angular
git checkout feat/react-rewrite
npm install
```

Set the backend URL (defaults to `http://localhost:3030/`):

```bash
export NEXT_PUBLIC_BACKEND_URL=http://localhost:3030/
```

Then start the dev server:

```bash
npm run dev
```

The app runs at http://localhost:3000.

## Building

```bash
npm run build
npm run start
```

## Tests

```bash
npm test        # vitest, single run
```

Type checking: `npx tsc --noEmit`.

## Code structure

- `app/` — Next.js App Router pages (file-based routing). Each `page.tsx` is a thin
  `'use client'` wrapper around a component from `src/components/`.
- `src/components/<module>/` — feature components (`root`, `news`, `about`, `tasks`,
  `discussion`, `profile`, `results`, `achievements`, `admin`, `privacy`) plus
  `src/components/shared/` for shared UI.
- `src/hooks/` — data hooks (react-query based, replacing the old RxJS services).
- `src/utils/` — pure utilities (formatters, graph layout, …).
- `src/api/` — typed fetch client + OpenAPI types generated from the backend swagger.
- `src/auth/` — auth context (login/logout/session refresh).
- `src/i18n.ts` — i18next setup (Czech).
- `src/routes.ts` — route path constants.
- `src/styles/` — Bootstrap 4 + the KSI SCSS theme.
- `public/assets/` — static assets (images, fonts, i18n).

## Deployment (Docker)

```bash
docker build --build-arg NEXT_PUBLIC_BACKEND_URL=https://your-backend/ -t ksi-frontend .
docker run -p 3000:3000 ksi-frontend
```
