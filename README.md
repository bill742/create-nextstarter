# create-nextstarter

Scaffold a new Next.js project based on the [NextStarter Lite](https://github.com/bill742/nextstarter-lite) boilerplate with a single command.

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

## Requirements

- Node.js 18 or higher
- Git
