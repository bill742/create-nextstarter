# create-nextstarter

Scaffold a new Next.js project based on the [NextStarter](https://github.com/bill742/nextstarter) boilerplate with a single command.

## Usage

```bash
npx create-nextstarter my-project
cd my-project
npm run dev
```

## What it does

1. Clones the NextStarter template
2. Cleans up template-only files (`.git`, `CLAUDE.md`, `CHANGELOG.md`, etc.)
3. Copies `.env.example` → `.env`
4. Sets the project `name` and `version` in `package.json`
5. Optionally runs `npm install`

## Requirements

- Node.js 18 or higher
- Git
