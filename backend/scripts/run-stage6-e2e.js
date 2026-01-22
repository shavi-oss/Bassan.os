#!/usr/bin/env node
/**
 * Stage 6 E2E Test Runner (Node.js)
 * ===================================
 * Governance: S2-L6 Dependency Freeze - package.json IMMUTABLE
 * Purpose: Cross-platform execution of E2E penetration tests
 *
 * Usage: node scripts/run-stage6-e2e.js
 *
 * Note: E2E tests do not require BASSAN_STAGE environment variable.
 * They test actual API endpoints, not the security linter.
 */

const { execSync } = require("child_process");

console.log("============================================");
console.log("Stage 6 E2E Test Runner (Node.js)");
console.log("============================================\n");

console.log("[INFO] Running E2E tests (runInBand)\n");

try {
  execSync("npm run test:e2e -- --runInBand", {
    stdio: "inherit",
    env: process.env,
  });
  console.log("\n[PASS] E2E tests completed successfully");
  process.exit(0);
} catch (error) {
  console.error(`\n[FAIL] E2E tests failed with exit code: ${error.status}`);
  process.exit(error.status || 1);
}
