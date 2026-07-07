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

const CLEANUP_PATHS = [
  ".git",
  "node_modules",
  ".next",
  ".env",
  ".skills",
  "CLAUDE.md",
  "CHANGELOG.md",
  "playwright-report",
  "test-results",
  "package-lock.json",
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

/**
 * Prompts the user with a question and returns their answer.
 * @param {string} question - The question to display.
 * @returns {Promise<string>} The user's input.
 */
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/**
 * Main orchestration function for scaffolding a new NextStarter project.
 * @param {string} projectName - The name of the new project directory.
 */
async function createNextStarter(projectName) {
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
  console.log("  \u2713 Cleaning up");

  // Step 3: Prompt for site name
  const siteName = (await prompt("? Site name? (e.g. My App) ")).trim() || projectName;

  // Step 4: Copy .env.example → .env and apply site name
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

  // Step 5: Rewrite package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = projectName;
    pkg.version = "0.1.0";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
  console.log("  \u2713 Updating package.json");

  // Step 6: Prompt to install dependencies
  const pmAnswer = (await prompt("\n? Install dependencies? [npm] / pnpm / bun / yarn / n (skip): ")).trim().toLowerCase();
  const pm = pmAnswer === "" ? "npm" : pmAnswer;

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

  // Step 7: Print next steps
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

module.exports = { createNextStarter };
