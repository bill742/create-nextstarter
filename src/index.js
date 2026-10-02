const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const readline = require("node:readline");

const TEMPLATE_REPO = "https://github.com/bill742/nextstarter-lite.git";

const PM_COMMANDS = {
  npm: "npm install",
  pnpm: "pnpm install",
  bun: "bun install",
  yarn: "yarn",
};

const STARTING_POINTS = ["blank", "full"];

/**
 * The template's own script for turning a clone into a starting point. It
 * knows which files are marketing content and what replaces them, so that
 * knowledge changes in the template repo, alongside the files themselves.
 */
const APPLY_SCRIPT = path.join(".nextstarter", "apply.mjs");

const CLEANUP_PATHS = [
  ".git",
  "node_modules",
  ".next",
  ".env",
  "playwright-report",
  "test-results",
  "package-lock.json",
];

/**
 * Fallback for templates that predate .nextstarter/. The template repo doubles
 * as the NextStarter marketing site, and these are its sales surface. Everything
 * that references them is gated on NEXT_PUBLIC_PRO_URL (see src/lib/upsell.ts),
 * which the scaffolded .env leaves blank, so removing them cannot break the
 * build or leave a dangling link.
 */
const LEGACY_TEMPLATE_PATHS = [
  ".skills",
  "CLAUDE.md",
  "CHANGELOG.md",
  "src/app/pro",
  "src/app/thanks",
  "src/components/pro",
  "src/lib/faq.ts",
  "tests/pro-page.spec.ts",
  "tests/thanks-page.spec.ts",
  "scripts/checkout-smoke.mjs",
];

/**
 * Removes a file or directory recursively.
 * @param {string} targetPath - Absolute path to remove.
 */
function removePath(targetPath) {
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true, force: true });
  }
}

let input = null;

/**
 * Lazily opens one readline interface for every prompt. Lines are queued as
 * they arrive, so piped answers (`printf 'My App\nn\n' | npx ...`) reach each
 * question in turn instead of the first question's interface swallowing them
 * all. Once stdin closes, prompts resolve to "" and take their defaults.
 * @returns {{ lines: string[], waiting: ((line: string) => void) | null, closed: boolean, rl: readline.Interface }}
 */
function getInput() {
  if (input) return input;
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  input = { closed: false, lines: [], rl, waiting: null };
  rl.on("SIGINT", () => {
    process.stdout.write("\n");
    process.exit(130);
  });
  rl.on("line", (line) => {
    if (input.waiting) {
      const resolve = input.waiting;
      input.waiting = null;
      resolve(line);
    } else {
      input.lines.push(line);
    }
  });
  rl.on("close", () => {
    input.closed = true;
    if (input.waiting) {
      const resolve = input.waiting;
      input.waiting = null;
      // Piped input is echoed by the waiting callback; a terminal needs the
      // line ended here, or the next output lands on the prompt's line.
      if (process.stdin.isTTY) process.stdout.write("\n");
      resolve("");
    }
  });
  return input;
}

/**
 * Prompts the user with a question and returns their answer.
 * @param {string} question - The question to display.
 * @returns {Promise<string>} The user's input, or "" once stdin has closed.
 */
function prompt(question) {
  const state = getInput();
  if (state.closed) {
    process.stdout.write(question);
  } else {
    // setPrompt rather than a plain write, so readline redraws the question
    // (not its default "> ") when it refreshes the line.
    state.rl.setPrompt(question);
    state.rl.prompt();
  }
  if (state.lines.length > 0) {
    const line = state.lines.shift();
    if (!process.stdin.isTTY) process.stdout.write(`${line}\n`);
    return Promise.resolve(line);
  }
  if (state.closed) {
    process.stdout.write("\n");
    return Promise.resolve("");
  }
  return new Promise((resolve) => {
    state.waiting = (line) => {
      if (!process.stdin.isTTY) process.stdout.write(`${line}\n`);
      resolve(line);
    };
  });
}

/**
 * Stops reading stdin, so the process can exit and child processes (the
 * package manager) get the terminal to themselves.
 */
function closePrompt() {
  if (input && !input.closed) input.rl.close();
}

/**
 * Asks which starting point to scaffold, re-asking until the answer is valid.
 * @returns {Promise<"blank" | "full">} The chosen starting point.
 */
async function promptStartingPoint() {
  for (;;) {
    const answer = (
      await prompt(
        "? Starting point? [blank] / full (keeps the example landing page): ",
      )
    )
      .trim()
      .toLowerCase();
    if (answer === "" || answer === "b" || answer === "blank") return "blank";
    if (answer === "f" || answer === "full") return "full";
    console.log('  Please answer "blank" or "full".');
  }
}

/**
 * Main orchestration function for scaffolding a new NextStarter project.
 * @param {string} projectName - The name of the new project directory.
 * @param {{ startingPoint?: "blank" | "full" }} [options] - Skips the
 *   starting-point prompt when set.
 */
async function createNextStarter(projectName, options = {}) {
  // Validate project name
  if (/\s/.test(projectName)) {
    console.error("Error: Project name must not contain spaces.");
    process.exit(1);
  }

  const targetDir = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`\nCreating a new NextStarter project in ./${projectName}...\n`);

  // Step 1: Clone template
  try {
    execSync(`git clone --depth=1 ${TEMPLATE_REPO} ${projectName}`, {
      stdio: "pipe",
    });
    console.log("  \u2713 Cloning template");
  } catch (err) {
    console.error("Error: Failed to clone template repository.");
    console.error(err.stderr?.toString() ?? err.message);
    process.exit(1);
  }

  // Step 2: Clean up unwanted files
  for (const relPath of CLEANUP_PATHS) {
    removePath(path.join(targetDir, relPath));
  }

  // Step 3: Choose a starting point and strip the marketing content. This runs
  // before the .env step because it replaces .env.example.
  if (fs.existsSync(path.join(targetDir, APPLY_SCRIPT))) {
    const startingPoint =
      options.startingPoint ?? (await promptStartingPoint());
    try {
      execSync(`"${process.execPath}" ${APPLY_SCRIPT} ${startingPoint}`, {
        cwd: targetDir,
        stdio: "pipe",
      });
    } catch (err) {
      console.error("Error: Failed to apply the starting point.");
      console.error(err.stderr?.toString() ?? err.message);
      process.exit(1);
    }
    console.log(`  \u2713 Cleaning up (${startingPoint} starting point)`);
  } else {
    if (options.startingPoint) {
      console.warn(
        `  This template version has no starting points; ignoring --${options.startingPoint}.`,
      );
    }
    for (const relPath of LEGACY_TEMPLATE_PATHS) {
      removePath(path.join(targetDir, relPath));
    }
    console.log("  \u2713 Cleaning up");
  }

  // Step 4: Prompt for site name
  const siteName = (await prompt("? Site name? (e.g. My App) ")).trim() || projectName;

  // Step 5: Copy .env.example → .env and apply site name
  const envExample = path.join(targetDir, ".env.example");
  const envTarget = path.join(targetDir, ".env");
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envTarget);
  }
  if (fs.existsSync(envTarget)) {
    let envContent = fs.readFileSync(envTarget, "utf8");
    envContent = envContent.replace(
      /^(NEXT_PUBLIC_SITE_NAME=).*$/m,
      `$1${siteName}`,
    );
    fs.writeFileSync(envTarget, envContent);
  }
  console.log("  \u2713 Setting up .env");

  // Step 6: Rewrite package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = projectName;
    pkg.version = "0.1.0";
    // Older templates only: its script file is removed with the rest of the
    // marketing surface, so leaving the entry behind would only dangle.
    delete pkg.scripts?.["test:checkout"];
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
  console.log("  \u2713 Updating package.json");

  // Step 7: Prompt to install dependencies
  const pmAnswer = (await prompt("\n? Install dependencies? [npm] / pnpm / bun / yarn / n (skip): ")).trim().toLowerCase();
  const pm = pmAnswer === "" ? "npm" : pmAnswer;
  closePrompt();

  // pnpm-workspace.yaml holds pnpm-only settings: the native-build allowlist
  // for sharp/unrs-resolver, and a minimum release age for supply-chain
  // hardening. npm, bun, and yarn all ignore it, so leaving it behind only
  // plants a confusing config file in a project that will never read it.
  // Kept when the user picks pnpm, and also when they skip install ("n") or
  // type something unrecognized, since we cannot know what they will run later.
  if (pm === "npm" || pm === "bun" || pm === "yarn") {
    removePath(path.join(targetDir, "pnpm-workspace.yaml"));
  }

  if (pm !== "n") {
    if (!(pm in PM_COMMANDS)) {
      console.warn(`  Unrecognized package manager "${pm}", falling back to npm.`);
    }
    const cmd = PM_COMMANDS[pm] ?? PM_COMMANDS.npm;
    try {
      execSync(cmd, { cwd: targetDir, stdio: "inherit" });
      console.log("\n  \u2713 Dependencies installed");
    } catch (err) {
      // pnpm (10+) blocks dependency build scripts by default and exits
      // non-zero. Packages are still installed on disk \u2014 only native build
      // steps (e.g. sharp, unrs-resolver) are deferred \u2014 so treat this as a
      // warning rather than a fatal error and point the user at approve-builds.
      if (pm === "pnpm") {
        console.warn(
          "\n  \u26a0 pnpm reported an error (see output above)." +
            "\n    If this was blocked build scripts, approve them inside the project:" +
            `\n      cd ${projectName} && pnpm approve-builds`
        );
      } else {
        console.error(`Error: ${cmd} failed.`);
        process.exit(1);
      }
    }
  }

  // Step 8: Print next steps
  console.log("\nDone! Your project is ready.\n");
  console.log(`  cd ${projectName}`);
  if (pm === "n") {
    console.log(`  ${PM_COMMANDS.npm}`);
  }
  const runCmd = pm === "bun" ? "bun dev" : pm === "pnpm" ? "pnpm dev" : pm === "yarn" ? "yarn dev" : "npm run dev";
  console.log(`  ${runCmd}\n`);
  console.log(
    "Edit .env to set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_SITE_NAME before deploying.",
  );
}

module.exports = { createNextStarter, STARTING_POINTS };
