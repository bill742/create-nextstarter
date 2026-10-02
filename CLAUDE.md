# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Project Does

`create-nextstarter` is a CLI scaffolding tool (zero external dependencies) that clones the [NextStarter Lite](https://github.com/bill742/nextstarter-lite) template and configures it for a new project. Published as `@bill742/create-nextstarter` and invoked via `npx create-nextstarter <project-name>`.

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

- **`bin/create-nextstarter.js`** — CLI entry point. Validates Node.js ≥18, parses `--help`, `--blank` and `--full`, extracts the project name from `argv`, then calls `createNextStarter(projectName, { startingPoint })`.
- **`src/index.js`** — Core orchestration. Executes a linear workflow: validate name → check for conflicts → `git clone --depth=1` the template → remove generic files (`CLEANUP_PATHS`) → choose a starting point (prompt or flag) and run the template's `.nextstarter/apply.mjs <blank|full>` → prompt for site name → write `.env` from `.env.example` → update `package.json` → prompt for package manager (npm/pnpm/bun/yarn) and optionally install dependencies.

All prompts share one readline interface that queues incoming lines, so piped answers reach each question in turn. Once stdin closes, prompts return `""` and take their defaults.

The tool uses only Node.js built-ins (`fs`, `path`, `child_process`, `readline`). Git must be available on `PATH` at runtime.

## Template Source

The cloned template is `https://github.com/bill742/nextstarter-lite.git`. The CLI always strips `.git`, `node_modules`, `.next`, `.env`, `playwright-report`, `test-results` and `package-lock.json`.

Everything template-specific (which marketing files to remove, and the neutral files that replace them) lives in the template repo under `.nextstarter/` (`manifest.json`, `overlays/`, `apply.mjs`), and the template's `Scaffold` workflow tests both modes. Change that list in the template, not here. `LEGACY_TEMPLATE_PATHS` is only a fallback for template commits that predate `.nextstarter/`.
