# create-nextstarter

Scaffold a new Next.js project based on the [NextStarter Lite](https://github.com/bill742/nextstarter-lite) boilerplate with a single command.

> **This scaffolds the free version.** NextStarter also comes in a **Pro**
> edition with authentication, a database, Stripe billing, email, a dashboard,
> and more — see [Free vs. Pro](#free-vs-pro) below.

## Usage

```bash
npx @bill742/create-nextstarter my-project
cd my-project
npm run dev
```

You'll be asked three things:

1. **Starting point** — `blank` (default) or `full`:
   - **blank** gives you an empty home page inside the app shell: header,
     footer, light/dark theme, privacy page, 404 page, tests, and CI.
   - **full** keeps the NextStarter landing page as example content to adapt.
2. **Site name** — written to `NEXT_PUBLIC_SITE_NAME` in `.env`.
3. **Package manager** — **npm** (default), **pnpm**, **bun**, or **yarn**.
   Enter `n` to skip installation.

Skip the first question with a flag:

```bash
npx @bill742/create-nextstarter my-project --blank
npx @bill742/create-nextstarter my-project --full
```

Answers can also be piped in, one per line:

```bash
printf 'My App\nn\n' | npx @bill742/create-nextstarter my-project --blank
```

## What it does

1. Clones the NextStarter template
2. Removes git history and build output (`.git`, `node_modules`, `.next`, etc.)
3. Applies your starting point by running the template's own
   `.nextstarter/apply.mjs`. In both modes this strips NextStarter's sales
   pages, changelog, and site metadata.
4. Copies `.env.example` → `.env` and sets your site name
5. Sets the project `name` and `version` in `package.json`
6. Optionally installs dependencies with your choice of npm, pnpm, bun, or yarn

## Free vs. Pro

This CLI scaffolds **NextStarter Lite** — the free version: a polished,
accessible marketing landing page with TypeScript, Tailwind CSS v4, testing, and
developer tooling ready to go.

**NextStarter Pro** ($199 one-time) adds a complete SaaS foundation on top:

- Authentication (Clerk), database (Prisma + PostgreSQL), and Stripe billing
- Transactional email (Resend), a dashboard app shell, and an admin panel
- MDX blog, contact form, and internationalization (English, Spanish, Arabic/RTL)
- Security headers, API rate limiting, analytics, error tracking, and full docs

Pro ships as a private GitHub repo you clone and update with `git pull`. Learn
more and get Pro → **[nextstarter.app](https://www.nextstarter.app/)**

## Requirements

- Node.js 18 or higher
- Git
