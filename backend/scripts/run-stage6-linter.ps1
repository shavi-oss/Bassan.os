# Stage 6 Security Linter Runner
# ================================
# Governance: S2-L6 Dependency Freeze - package.json IMMUTABLE
# Purpose: Runs security-linter.spec.ts with BASSAN_STAGE=6 environment variable
#
# Why this script exists:
# - Security linter defaults to STAGE 4 (FAIL-CLOSED behavior)
# - Stage 5/6 modules are present in codebase
# - Without BASSAN_STAGE=6, linter will correctly FAIL
# - This script sets the required environment variable

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Stage 6 Security Linter Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[GOVERNANCE] Setting BASSAN_STAGE=6" -ForegroundColor Yellow

$env:BASSAN_STAGE = "6"

Write-Host "[INFO] BASSAN_STAGE = $env:BASSAN_STAGE" -ForegroundColor Green
Write-Host "[INFO] Running security-linter.spec.ts" -ForegroundColor Green
Write-Host ""

npm test -- tests/security/security-linter.spec.ts --runInBand

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "[PASS] Security Linter completed successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[FAIL] Security Linter failed with exit code: $exitCode" -ForegroundColor Red
}

exit $exitCode
