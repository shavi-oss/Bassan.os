#!/usr/bin/env node
/**
 * Stage 6 Full Test Suite Runner (Node.js)
 * ==========================================
 * Governance: S2-L6 Dependency Freeze - package.json IMMUTABLE
 * Purpose: Cross-platform execution of lint + all Jest tests with BASSAN_STAGE=6
 *
 * Usage: node scripts/run-stage6-tests.js
 *
 * Execution order:
 * 1. npm run lint (code quality)
 * 2. npm test -- --runInBand (all unit/integration tests)
 */

const { execSync } = require("child_process");

console.log("============================================");
console.log("Stage 6 Full Test Suite Runner (Node.js)");
console.log("============================================\n");

// Set BASSAN_STAGE=6 for security linter within test suite
process.env.BASSAN_STAGE = "6";

console.log("[GOVERNANCE] Setting BASSAN_STAGE=6");
console.log(`[INFO] BASSAN_STAGE = ${process.env.BASSAN_STAGE}\n`);

const env = { ...process.env, BASSAN_STAGE: "6" };

// Step 1: Lint
console.log("----------------------------------------");
console.log("[STEP 1/2] Running ESLint");
console.log("----------------------------------------\n");

try {
  execSync("npm run lint", { stdio: "inherit", env });
  console.log("\n[PASS] ESLint completed successfully\n");
} catch (error) {
  console.error(`\n[FAIL] ESLint failed with exit code: ${error.status}`);
  process.exit(error.status || 1);
}

// Step 2: Jest Tests
console.log("----------------------------------------");
console.log("[STEP 2/2] Running Jest Tests (runInBand)");
console.log("----------------------------------------\n");

try {
  execSync("npm test -- --runInBand", { stdio: "inherit", env });
  console.log("\n============================================");
  console.log("[PASS] All Stage 6 tests completed successfully");
  console.log("============================================");
  process.exit(0);
} catch (error) {
  console.error(`\n[FAIL] Jest tests failed with exit code: ${error.status}`);
  process.exit(error.status || 1);
}
