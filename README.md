# Punyalink (frontend)

React + TypeScript app for **Punyalink**: multi-tenant link-in-bio style stores on subdomains (for example `https://yourstore.example.com`), backed by the Punyalink API.

## Features

- **Apex host** (`localhost`, configured apex domains): marketing landing and **store registration** (subdomain + email verification flow).
- **Store host** (`{subdomain}.{base domain}` or `{subdomain}.localhost` in dev): public link list, short-link redirects, collections, owner login, and dashboard.

## Prerequisites

- Node.js 18+ (recommended)
- `pnpm` or `npm`
- Running Punyalink API (see `.env.example` for default base URL)

## Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment defaults and adjust:

   ```bash
   cp .env.example .env
   ```

3. Start the dev server:

   ```bash
   pnpm dev
   ```

4. Build for production:

   ```bash
   pnpm build
   ```

   Output is written to `dist/`.

5. Typecheck:

   ```bash
   pnpm typecheck
   ```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | API origin (default `http://localhost:3000`). |
| `VITE_BASE_DOMAIN` | Production-style base domain used in URLs and apex parsing (default `punyalink.id`). |
| `VITE_APEX_HOSTS` | Comma-separated hostnames treated as apex (no tenant). |
| `VITE_DEV_TENANT` | On plain `localhost` / `127.0.0.1`, pretend this subdomain so tenant routes load without `*.localhost`. |

Registration and OTP calls use the API **without** the `x-tenant-subdomain` header; tenant-scoped routes send that header automatically.

## Local multi-tenant routing

- Open the apex URL (for example `http://localhost:5173`) for the landing page and `/register`.
- To hit a specific store on one origin, either set `VITE_DEV_TENANT=myshop` or open `http://myshop.localhost:5173` (with your dev server port).

After signup, the app redirects to **`{subdomain}.localhost`** (dev) or **`{subdomain}.{VITE_BASE_DOMAIN}`** (non-localhost) at **`/login`**.

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Vite dev server |
| `pnpm build` | Production bundle |
| `pnpm typecheck` | `tsc --noEmit` |

## Tech stack

- [Vite](https://vitejs.dev/)
- [React 18](https://react.dev/)
- [React Router 7](https://reactrouter.com/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- UI primitives from Radix / shadcn-style components in `src/app/components/ui/`
