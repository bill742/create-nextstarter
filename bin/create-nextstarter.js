#!/usr/bin/env node

// Node version check
const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
if (nodeMajor < 18) {
  console.error("Error: Node.js 18 or higher is required.");
  process.exit(1);
}

const { createNextStarter } = require("../src/index.js");

const args = process.argv.slice(2);
const projectName = args[0];

if (!projectName || projectName === "--help" || projectName === "-h") {
  console.log("Usage: create-nextstarter <project-name>");
  console.log("Example: npx create-nextstarter my-project");
  process.exit(projectName ? 0 : 1);
}

createNextStarter(projectName);
