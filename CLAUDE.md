# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

`create-nextstarter` is a CLI scaffolding tool (zero external dependencies) that clones the [NextStarter](https://github.com/bill742/nextstarter) template and configures it for a new project. Published as `@bill742/create-nextstarter` and invoked via `npx create-nextstarter <project-name>`.

## Running / Testing

There are no npm scripts. Test manually by running the CLI directly:

```sh
node bin/create-nextstarter.js my-test-project
```

Or simulate what npx would do:

```sh
npx . my-test-project
```

## Architecture

Two files contain all the logic:

- **`bin/create-nextstarter.js`** — CLI entry point. Validates Node.js ≥18, parses `--help`/`--version` flags, extracts the project name from `argv`, then calls `createNextStarter()`.
- **`src/index.js`** — Core orchestration. Executes a linear 7-step workflow: validate name → check for conflicts → `git clone --depth=1` the template → remove template-only files → prompt for site name → write `.env` from `.env.example` → update `package.json` → optionally run `npm install`.

The tool uses only Node.js built-ins (`fs`, `path`, `child_process`, `readline`). Git must be available on `PATH` at runtime.

## Template Source

The cloned template is `https://github.com/bill742/nextstarter.git`. Files stripped during scaffolding: `.git`, `node_modules`, `.next`, `.env`, `.skills`, `CLAUDE.md`, `CHANGELOG.md`, `playwright-report`, `test-results`, `package-lock.json`.
