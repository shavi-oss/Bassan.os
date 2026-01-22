#!/usr/bin/env node
/**
 * Stage 6 Security Linter Runner (Node.js)
 * ==========================================
 * Governance: S2-L6 Dependency Freeze - package.json IMMUTABLE
 * Purpose: Cross-platform execution of security-linter.spec.ts with BASSAN_STAGE=6
 *
 * Usage: node scripts/run-stage6-linter.js
 *
 * Why this script exists:
 * - Security linter defaults to STAGE 4 (FAIL-CLOSED behavior)
 * - Stage 5/6 modules are present in codebase
 * - Without BASSAN_STAGE=6, linter will correctly FAIL
 * - This script sets the required environment variable for any OS
 */

const { execSync } = require("child_process");

console.log("============================================");
console.log("Stage 6 Security Linter Runner (Node.js)");
console.log("============================================\n");

// Set BASSAN_STAGE=6 for security linter
process.env.BASSAN_STAGE = "6";

console.log("[GOVERNANCE] Setting BASSAN_STAGE=6");
console.log(`[INFO] BASSAN_STAGE = ${process.env.BASSAN_STAGE}`);
console.log("[INFO] Running security-linter.spec.ts\n");

try {
  execSync("npm test -- tests/security/security-linter.spec.ts --runInBand", {
    stdio: "inherit",
    env: { ...process.env, BASSAN_STAGE: "6" },
  });
  console.log("\n[PASS] Security Linter completed successfully");
  process.exit(0);
} catch (error) {
  console.error(`\n[FAIL] Security Linter failed with exit code: ${error.status}`);
  process.exit(error.status || 1);
}
