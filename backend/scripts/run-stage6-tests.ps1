# Stage 6 Full Test Suite Runner
# ================================
# Governance: S2-L6 Dependency Freeze - package.json IMMUTABLE
# Purpose: Runs lint + all Jest tests with BASSAN_STAGE=6 environment variable
#
# Execution order:
# 1. npm run lint (code quality)
# 2. npm test -- --runInBand (all unit/integration tests)

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Stage 6 Full Test Suite Runner" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[GOVERNANCE] Setting BASSAN_STAGE=6" -ForegroundColor Yellow

$env:BASSAN_STAGE = "6"

Write-Host "[INFO] BASSAN_STAGE = $env:BASSAN_STAGE" -ForegroundColor Green
Write-Host ""

# Step 1: Lint
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "[STEP 1/2] Running ESLint" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

npm run lint

$lintExitCode = $LASTEXITCODE

if ($lintExitCode -ne 0) {
    Write-Host ""
    Write-Host "[FAIL] ESLint failed with exit code: $lintExitCode" -ForegroundColor Red
    exit $lintExitCode
}

Write-Host ""
Write-Host "[PASS] ESLint completed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Jest Tests
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "[STEP 2/2] Running Jest Tests (runInBand)" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

npm test -- --runInBand

$testExitCode = $LASTEXITCODE

if ($testExitCode -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "[PASS] All Stage 6 tests completed successfully" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[FAIL] Jest tests failed with exit code: $testExitCode" -ForegroundColor Red
}

exit $testExitCode
