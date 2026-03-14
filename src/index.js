const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");
const readline = require("node:readline");

const TEMPLATE_REPO = "https://github.com/bill742/nextstarter.git";

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

  // Step 3: Copy .env.example → .env
  const envExample = path.join(targetDir, ".env.example");
  const envTarget = path.join(targetDir, ".env");
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envTarget);
  }
  console.log("  \u2713 Setting up .env");

  // Step 4: Rewrite package.json
  const pkgPath = path.join(targetDir, "package.json");
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    pkg.name = projectName;
    pkg.version = "0.1.0";
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
  }
  console.log("  \u2713 Updating package.json");

  // Step 5: Prompt to install dependencies
  const answer = await prompt("\n? Install dependencies now? (Y/n) ");
  const shouldInstall = answer.trim().toLowerCase() !== "n";

  if (shouldInstall) {
    try {
      execSync("npm install", { cwd: targetDir, stdio: "inherit" });
      console.log("\n  \u2713 Dependencies installed");
    } catch (err) {
      console.error("Error: npm install failed.");
      process.exit(1);
    }
  }

  // Step 6: Print next steps
  console.log("\nDone! Your project is ready.\n");
  console.log(`  cd ${projectName}`);
  if (!shouldInstall) {
    console.log("  npm install");
  }
  console.log("  npm run dev\n");
  console.log(
    "Edit .env to set NEXT_PUBLIC_SITE_URL and NEXT_PUBLIC_SITE_NAME before deploying.",
  );
}

module.exports = { createNextStarter };
