# Jobrythm Frontend

Jobrythm is a SaaS job costing and quoting dashboard for tradespeople.

## Stack

- React 18 + TypeScript (strict mode)
- Vite
- React Router v6
- TanStack Query v5
- Zustand
- React Hook Form + Zod
- Axios
- Tabler UI (`@tabler/core` + `@tabler/icons-react`)
- MSW for local API mocking

## Setup

```bash
npm install
npm run dev
```

The app runs with MSW enabled in development and intercepts `/api/*` requests with mock handlers.

## Build

```bash
npm run build
npm run preview
```
