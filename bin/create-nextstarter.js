#!/usr/bin/env node

// Node version check
const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor < 18) {
  console.error("Error: Node.js 18 or higher is required.");
  process.exit(1);
}

const { createNextStarter, STARTING_POINTS } = require("../src/index.js");

const args = process.argv.slice(2);

function printUsage() {
  console.log("Usage: @bill742/create-nextstarter <project-name> [--blank | --full]");
  console.log("");
  console.log("Options:");
  console.log("  --blank     Start from an empty home page (default)");
  console.log("  --full      Keep the example landing page");
  console.log("  -h, --help  Show this help");
  console.log("");
  console.log("Example: npx @bill742/create-nextstarter my-project");
}

if (args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(0);
}

const startingPoints = STARTING_POINTS.filter((name) =>
  args.includes(`--${name}`),
);
if (startingPoints.length > 1) {
  console.error("Error: Choose either --blank or --full, not both.");
  process.exit(1);
}

const unknownFlag = args.find(
  (arg) => arg.startsWith("-") && !STARTING_POINTS.includes(arg.slice(2)),
);
if (unknownFlag) {
  console.error(`Error: Unknown option "${unknownFlag}".`);
  printUsage();
  process.exit(1);
}

const projectName = args.find((arg) => !arg.startsWith("-"));
if (!projectName) {
  printUsage();
  process.exit(1);
}

createNextStarter(projectName, { startingPoint: startingPoints[0] });
