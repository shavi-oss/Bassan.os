# Stage 6 Runner Scripts — Runbook

**Document Type:** Governance-Compliant Execution Guide  
**Created:** 2026-01-21  
**Stage:** 6  
**Governance:** S2-L6 Dependency Freeze ACTIVE

---

## 1. Governance Context

### Why package.json Scripts Are Forbidden

| Rule                        | Citation          | Enforcement                                  |
| --------------------------- | ----------------- | -------------------------------------------- |
| **S2-L6 Dependency Freeze** | `STAGE_2_LAWS.md` | package.json is IMMUTABLE after Stage 2      |
| **Patch 6.0 Exception**     | `STAGE_6_LAWS.md` | ONLY `cron-parser` addition allowed          |
| **No Patch 6.2**            | N/A               | No authorization exists for script additions |

> [!CAUTION]
> **Any modification to package.json outside Patch 6.0 scope is a GOVERNANCE VIOLATION.**
> External scripts (PowerShell / Node.js) are the ONLY compliant solution.

---

## 2. Security Linter Stage Behavior

### Fail-Closed Design

The security linter implements a **fail-closed** stage supersession model:

| Environment            | Default Stage | Behavior                                |
| ---------------------- | ------------- | --------------------------------------- |
| `BASSAN_STAGE` not set | **4**         | Stage 5/6 modules flagged as violations |
| `BASSAN_STAGE=6`       | **6**         | All Stage 1-6 modules/endpoints allowed |

### Why This Is Correct Behavior

1. **Stage Supersession Model**: Each stage builds on previous stages
2. **Fail-Closed Security Posture**: Unknown stage defaults to strictest known stage
3. **Explicit Opt-In**: Stage 6 rules require explicit environment declaration

### Evidence Snapshots

**Snapshot A — Default Stage 4 (EXPECTED FAIL)**

```
[SECURITY GOVERNANCE] Executing Linter for STAGE 4
S4-L2 VIOLATION: Modules outside Stage 4 scope
  - scheduler
  - executor
  - cron-validation
  - scheduled-triggers
  - deferred-execution
S4-L3 VIOLATION: Endpoints outside Stage 4 allowlist

Test Suites: 1 failed
```

**Snapshot B — Explicit Stage 6 (EXPECTED PASS)**

```
[SECURITY GOVERNANCE] Executing Linter for STAGE 6
S6-L1: _unsafeClient FORBIDDEN in Stage 6 modules ✓
S6-L2: Module scope (Stage 6) ✓
S6-L3: No controllers in Stage 6 modules ✓
S6-L7: IMMUTABILITY CHECK (Stage 0-5 artifacts) ✓

Test Suites: 1 passed
Tests: 20 passed, 5 skipped
```

---

## 3. Available Scripts

### PowerShell (Windows)

| Script                  | Purpose               | Command                           |
| ----------------------- | --------------------- | --------------------------------- |
| `run-stage6-linter.ps1` | Security linter only  | `.\scripts\run-stage6-linter.ps1` |
| `run-stage6-tests.ps1`  | Lint + all Jest tests | `.\scripts\run-stage6-tests.ps1`  |
| `run-stage6-e2e.ps1`    | E2E penetration tests | `.\scripts\run-stage6-e2e.ps1`    |

### Node.js (Cross-Platform)

| Script                 | Purpose               | Command                             |
| ---------------------- | --------------------- | ----------------------------------- |
| `run-stage6-linter.js` | Security linter only  | `node scripts/run-stage6-linter.js` |
| `run-stage6-tests.js`  | Lint + all Jest tests | `node scripts/run-stage6-tests.js`  |
| `run-stage6-e2e.js`    | E2E penetration tests | `node scripts/run-stage6-e2e.js`    |

---

## 4. Execution Guide

### Windows (PowerShell)

```powershell
# Navigate to backend directory
cd backend

# Run security linter
.\scripts\run-stage6-linter.ps1

# Run full test suite
.\scripts\run-stage6-tests.ps1

# Run E2E tests
.\scripts\run-stage6-e2e.ps1
```

### Any OS (Node.js)

```bash
# Navigate to backend directory
cd backend

# Run security linter
node scripts/run-stage6-linter.js

# Run full test suite
node scripts/run-stage6-tests.js

# Run E2E tests
node scripts/run-stage6-e2e.js
```

### Manual Execution (Without Scripts)

```powershell
# Windows PowerShell - Security Linter
$env:BASSAN_STAGE="6"; npm test -- tests/security/security-linter.spec.ts --runInBand

# Windows PowerShell - Full Tests
$env:BASSAN_STAGE="6"; npm test -- --runInBand

# Linux/macOS - Security Linter
BASSAN_STAGE=6 npm test -- tests/security/security-linter.spec.ts --runInBand

# Linux/macOS - Full Tests
BASSAN_STAGE=6 npm test -- --runInBand
```

---

## 5. Expected Successful Outputs

### Security Linter (run-stage6-linter)

```
[SECURITY GOVERNANCE] Executing Linter for STAGE 6

PASS tests/security/security-linter.spec.ts
  Security Linter
    S6-L1: _unsafeClient FORBIDDEN in Stage 6 modules
      ✓ should forbid _unsafeClient in scheduler module
      ✓ should forbid _unsafeClient in executor module
      ✓ should forbid _unsafeClient in cron-validation module
    S6-L2: Module scope (Stage 6)
      ✓ should forbid any new modules beyond Stage 6 scope
    S6-L3: No controllers in Stage 6 modules
      ✓ should forbid any controller files in Stage 6 modules
    S6-L7: IMMUTABILITY CHECK (Stage 0-5 artifacts)
      ✓ should fail if any Stage 0-5 artifact is modified

Test Suites: 1 passed, 1 total
Tests: 20 passed, 5 skipped, 25 total
```

### Full Test Suite (run-stage6-tests)

```
[STEP 1/2] Running ESLint
[PASS] ESLint completed successfully

[STEP 2/2] Running Jest Tests (runInBand)
Test Suites: 12 passed, 12 total
Tests: 127+ passed
```

### E2E Tests (run-stage6-e2e)

```
PASS tests/security/penetration.e2e-spec.ts
  🔓 Security Penetration Tests
    🎯 IDOR Attacks (3 tests) ✓
    💉 organizationId Injection Attacks (2 tests) ✓
    🔐 Authentication Bypass Attacks (3 tests) ✓
    📊 Data Enumeration Prevention (2 tests) ✓
    ✅ Legitimate Access (3 tests) ✓

Tests: 13 passed, 13 total
```

---

## 6. Troubleshooting

### Problem: Security Linter Fails with Stage 4 Violations

**Symptom:**

```
[SECURITY GOVERNANCE] Executing Linter for STAGE 4
S4-L2 VIOLATION: Modules outside Stage 4 scope
```

**Cause:** `BASSAN_STAGE` environment variable is not set.

**Solution:** Use the provided scripts or set the variable manually:

```powershell
$env:BASSAN_STAGE="6"
```

### Problem: Tests Run in Parallel and Fail

**Symptom:** Random test failures, deadlocks, or timeouts.

**Cause:** Jest running tests in parallel with database operations.

**Solution:** Always use `--runInBand` flag (included in all scripts).

### Problem: E2E Tests Fail with 404

**Symptom:** E2E tests return 404 for existing endpoints.

**Cause:** Application not using correct global prefix.

**Solution:** Ensure `app.setGlobalPrefix("api/v1")` is set in test setup.

---

## 7. Governance Guardrails

### ❌ FORBIDDEN Actions

- Editing `package.json` or `package-lock.json`
- Adding npm scripts
- Modifying dependencies
- Creating unauthorized patches
- Modifying Stage 0-5 artifacts
- Running tests without `BASSAN_STAGE=6` for security linter

### ✅ ALLOWED Actions

- Using these external scripts
- Setting `BASSAN_STAGE=6` environment variable
- Running tests with `--runInBand`
- Creating documentation under `backend/AUDITS/`
- Creating scripts under `backend/scripts/`

### 🛑 Actions Requiring New Patch Authorization

- Adding new dependencies to package.json
- Modifying existing npm scripts
- Changing test configuration in package.json
- Any change to Stage 0-5 locked files

---

## 8. Verification Commands

```powershell
# Verify no package.json changes
git diff --name-only | Select-String "package"

# Run all Stage 6 verification
.\scripts\run-stage6-linter.ps1
.\scripts\run-stage6-tests.ps1
.\scripts\run-stage6-e2e.ps1
```

---

**Document Status:** APPROVED FOR STAGE 6 EXECUTION  
**Governance Compliance:** VERIFIED  
**Last Updated:** 2026-01-21
