# Stage 6 E2E Test Runner
# ========================
# Governance: S2-L6 Dependency Freeze - package.json IMMUTABLE
# Purpose: Runs E2E penetration tests (no BASSAN_STAGE needed for E2E)
#
# Note: E2E tests do not require BASSAN_STAGE environment variable
# They test actual API endpoints, not the security linter

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Stage 6 E2E Test Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Running E2E tests (runInBand)" -ForegroundColor Green
Write-Host ""

npm run test:e2e -- --runInBand

$exitCode = $LASTEXITCODE

if ($exitCode -eq 0) {
    Write-Host ""
    Write-Host "[PASS] E2E tests completed successfully" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[FAIL] E2E tests failed with exit code: $exitCode" -ForegroundColor Red
}

exit $exitCode
