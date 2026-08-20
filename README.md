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

When prompted, choose your preferred package manager: **npm** (default), **pnpm**, **bun**, or **yarn**. Enter `n` to skip installation.

## What it does

1. Clones the NextStarter template
2. Cleans up template-only files (`.git`, `CLAUDE.md`, `CHANGELOG.md`, etc.)
3. Copies `.env.example` → `.env`
4. Sets the project `name` and `version` in `package.json`
5. Optionally installs dependencies with your choice of npm, pnpm, bun, or yarn

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
