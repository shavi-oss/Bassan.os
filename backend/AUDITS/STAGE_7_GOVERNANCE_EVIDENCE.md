PS D:\Basaan os\BassanOs> git rev-parse HEAD
8a1c1e01bc797f098aa03c446ac6c48a030034f0

PS D:\Basaan os\BassanOs> git status --porcelain
PS D:\Basaan os\BassanOs> git show --no-patch stage7-governance-docs-complete  
commit 8a1c1e01bc797f098aa03c446ac6c48a030034f0 (HEAD -> master, tag: stage7-governance-docs-complete)
Author: shavi-oss <eslamabdelshafi2@gmail.com>
Date: Thu Jan 22 07:30:34 2026 +0200

    docs(stage6,stage7): add governance, locks, audits, and runner documentation

PS D:\Basaan os\BassanOs> cd backend
PS D:\Basaan os\BassanOs\backend> npm run lint

> bassan-backend@0.0.1 lint
> eslint "{src,tests}/\*_/_.ts"

=============

WARNING: You are currently running a version of TypeScript which is not officially supported by @typescript-eslint/typescript-estree.

You may find that it works just fine, or you may not.

SUPPORTED TYPESCRIPT VERSIONS: >=4.3.5 <5.4.0

YOUR TYPESCRIPT VERSION: 5.9.3

Please only submit bug reports when using the officially supported version.

=============
PS D:\Basaan os\BassanOs\backend> $env:BASSAN_STAGE="6"; npm test -- tests/security/security-linter.spec.ts --runInBand

> bassan-backend@0.0.1 test
> jest --config jest.config.js tests/security/security-linter.spec.ts --runInBand

console.log

    [SECURITY GOVERNANCE] Executing Linter for STAGE 6

      at tests/security/security-linter.spec.ts:83:11

PASS tests/security/security-linter.spec.ts (13.319 s)
Security Linter
S2-L1: \_unsafeClient usage restriction  
 √ should only allow \_unsafeClient in auth/organizations/prisma (33 ms)  
 L2: Indirect model relation-based filters  
 √ should enforce relation-based filters for Permission queries (29 ms)  
 √ should enforce relation-based filters for RefreshToken queries (28 ms)  
 S2-L4: Controller guard enforcement  
 √ should enforce @UseGuards(JwtAuthGuard, TenantGuard) on handlers (20 ms)
S2-L3: Endpoint allowlist enforcement  
 ○ skipped should only allow Stage 1+2 endpoints  
 S2-L2: Module allowlist enforcement
○ skipped should only allow Stage 1+2 modules  
 S2-L6: Dependency Freeze  
 √ package.json must be immutable (no changes allowed) (2035 ms)  
 S3-L1: \_unsafeClient FORBIDDEN in workflow-instances  
 ○ skipped should forbid \_unsafeClient in workflow-instances module  
 S3-L2: Module allowlist (Stage 3)  
 ○ skipped should only allow Stage 1+2+3 modules  
 S3-L3: Endpoint allowlist (Stage 3)  
 ○ skipped should only allow Stage 1+2+3 endpoints  
 S4-L1: \_unsafeClient FORBIDDEN in workflow-triggers  
 √ should forbid \_unsafeClient in workflow-triggers module (3 ms)  
 S4-L2: Module allowlist (Stage 4)  
 √ should only allow Stage 1+2+3+4 modules (1 ms)  
 S4-L3: Endpoint allowlist (Stage 4)  
 √ should only allow Stage 1+2+3+4 endpoints (18 ms)  
 S3-L7: IMMUTABILITY CHECK (Stage 0-2 artifacts)  
 √ should fail if any Stage 0-2 artifact is modified (1923 ms)  
 S5-L1: \_unsafeClient FORBIDDEN in Stage 5 modules  
 √ should forbid \_unsafeClient in scheduled-triggers module (2 ms)  
 √ should forbid \_unsafeClient in deferred-execution module (2 ms)  
 S5-L2: Module allowlist (Stage 5)  
 √ should only allow Stage 1+2+3+4+5 modules (1 ms)  
 S5-L3: Endpoint allowlist (Stage 5)  
 √ should only allow Stage 1+2+3+4+5 endpoints (19 ms)  
 S5-L7: IMMUTABILITY CHECK (Stage 0-4 artifacts)  
 √ should fail if any Stage 0-4 artifact is modified (1922 ms)  
 S6-L1: \_unsafeClient FORBIDDEN in Stage 6 modules  
 √ should forbid \_unsafeClient in scheduler module (1 ms)  
 √ should forbid \_unsafeClient in executor module (1 ms)  
 √ should forbid \_unsafeClient in cron-validation module (1 ms)  
 S6-L2: Module scope (Stage 6)  
 √ should forbid any new modules beyond Stage 6 scope (1 ms)  
 S6-L3: No controllers in Stage 6 modules  
 √ should forbid any controller files in Stage 6 modules (2 ms)  
 S6-L7: IMMUTABILITY CHECK (Stage 0-5 artifacts)  
 √ should fail if any Stage 0-5 artifact is modified (1905 ms)

Test Suites: 1 passed, 1 total  
Tests: 5 skipped, 20 passed, 25 total  
Snapshots: 0 total
Time: 14.748 s
Ran all test suites matching /tests\\security\\security-linter.spec.ts/i.  
PS D:\Basaan os\BassanOs\backend> npm test -- --runInBand

> bassan-backend@0.0.1 test
> jest --config jest.config.js --runInBand

PASS tests/integration/stage5-async.spec.ts (31.715 s)
PASS tests/security/security-linter.spec.ts (8.103 s)
● Console

    console.log

      [SECURITY GOVERNANCE] Executing Linter for STAGE 6

      at tests/security/security-linter.spec.ts:83:11

PASS tests/integration/stage3-execution.spec.ts (12.864 s)
[Nest] 66380 - 01/22/2026, 7:41:59 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Lead.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:00 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for User.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:00 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Role.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:01 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Task.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:01 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Permission.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:05 AM ERROR [PrismaService] 🚨 SECURITY: Attempted $queryRaw - BLOCKED
[Nest] 66380 - 01/22/2026, 7:42:05 AM ERROR [PrismaService] 🚨 SECURITY: Attempted $executeRaw - BLOCKED
[Nest] 66380 - 01/22/2026, 7:42:06 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Lead.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:06 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Permission.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:07 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for RefreshToken.findMany. Model is not in GLOBAL_MODELS whitelist.
PASS tests/unit/core/security-fixes.spec.ts (10.388 s)
PASS tests/integration/stage4-triggers.spec.ts (7.686 s)
[Nest] 66380 - 01/22/2026, 7:42:18 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for User.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:18 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for Lead.findMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:21 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for WorkflowDefinition.findMany. Model is not in GLOBAL_MODELS whitelist.
PASS tests/unit/core/prisma.extension.spec.ts (5.66 s)
[Nest] 66380 - 01/22/2026, 7:42:23 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for WorkflowInstance.deleteMany. Model is not in GLOBAL_MODELS whitelist.
[Nest] 66380 - 01/22/2026, 7:42:24 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for WorkflowInstance.deleteMany. Model is not in GLOBAL_MODELS whitelist.
PASS tests/integration/stage6-background-workers.spec.ts
● Console

    console.warn
      Pre-cleanup warning: Error: TENANT_ISOLATION_VIOLATION: No tenant context for WorkflowInstance.deleteMany. Model is not in GLOBAL_MODELS whitelist.
          at Array.$allOperations (D:\Basaan os\BassanOs\backend\src\core\database\prisma.extension.ts:137:21)
          at D:\Basaan os\BassanOs\backend\node_modules\@prisma\client\runtime\library.js:31:9641
          at i (D:\Basaan os\BassanOs\backend\node_modules\@prisma\client\runtime\library.js:121:1016)
          at PrismaPromise.then (D:\Basaan os\BassanOs\backend\node_modules\@prisma\client\runtime\library.js:121:1091)

      53 |       // non-fatal in case DB is already clean
      54 |       // eslint-disable-next-line no-console
    > 55 |       console.warn("Pre-cleanup warning:", e);
         |               ^
      56 |     }
      57 |
      58 |     // Seed Tenants

      at Object.<anonymous> (tests/integration/stage6-background-workers.spec.ts:55:15)

    console.warn
      Cleanup failed (non-critical): Error: TENANT_ISOLATION_VIOLATION: No tenant context for WorkflowInstance.deleteMany. Model is not in GLOBAL_MODELS whitelist.
          at Array.$allOperations (D:\Basaan os\BassanOs\backend\src\core\database\prisma.extension.ts:137:21)
          at D:\Basaan os\BassanOs\backend\node_modules\@prisma\client\runtime\library.js:31:9641
          at i (D:\Basaan os\BassanOs\backend\node_modules\@prisma\client\runtime\library.js:121:1016)
          at PrismaPromise.then (D:\Basaan os\BassanOs\backend\node_modules\@prisma\client\runtime\library.js:121:1091)

      115 |     } catch (e) {
      116 |       // eslint-disable-next-line no-console
    > 117 |       console.warn("Cleanup failed (non-critical):", e);
          |               ^
      118 |     }
      119 |
      120 |     if (app) {

      at Object.<anonymous> (tests/integration/stage6-background-workers.spec.ts:117:15)

[Nest] 66380 - 01/22/2026, 7:42:24 AM ERROR [PrismaService] 🚨 SECURITY: Attempted $queryRaw - BLOCKED
[Nest] 66380 - 01/22/2026, 7:42:24 AM ERROR [PrismaService] 🚨 SECURITY: Attempted $queryRawUnsafe - BLOCKED  
[Nest] 66380 - 01/22/2026, 7:42:24 AM ERROR [PrismaService] 🚨 SECURITY: Attempted $executeRaw - BLOCKED  
[Nest] 66380 - 01/22/2026, 7:42:24 AM ERROR [PrismaService] 🚨 SECURITY: Attempted $executeRawUnsafe - BLOCKED  
[Nest] 66380 - 01/22/2026, 7:42:24 AM ERROR [PrismaTenantExtension] 🚨 TENANT_ISOLATION_VIOLATION: No tenant context for User.findMany. Model is not in GLOBAL_MODELS whitelist.
PASS tests/core/foundation/foundation.spec.ts
PASS tests/isolation.spec.ts
PASS tests/unit/cron-validation.service.spec.ts
[Nest] 66380 - 01/22/2026, 7:42:26 AM ERROR [ExecutorService] Object:
{
"executionId": "execution-4",
"organizationId": "org-4",
"outcome": "failure",
"errorMessage": "DB error",
"attemptNumber": 1
}

[Nest] 66380 - 01/22/2026, 7:42:26 AM ERROR [ExecutorService] Failed to process execution execution-4 (org: org-4)
Error: DB error
at Object.<anonymous> (D:\Basaan os\BassanOs\backend\tests\unit\executor.service.spec.ts:273:9)
at Promise.then.completed (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\utils.js:298:28)
at new Promise (<anonymous>)
at callAsyncCircusFn (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\utils.js:231:10)
at \_callCircusTest (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:316:40)
at \_runTest (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:252:3)
at \_runTestsForDescribeBlock (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:126:9)
at \_runTestsForDescribeBlock (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:121:9)
at \_runTestsForDescribeBlock (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:121:9)
at run (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:71:3)
at runAndTransformResultsToJestFormat (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\legacy-code-todo-rewrite\jestAdapterInit.js:122:21)  
 at jestAdapter (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\legacy-code-todo-rewrite\jestAdapter.js:79:19)
at runTestInternal (D:\Basaan os\BassanOs\backend\node_modules\jest-runner\build\runTest.js:367:16)
at runTest (D:\Basaan os\BassanOs\backend\node_modules\jest-runner\build\runTest.js:444:34)
[Nest] 66380 - 01/22/2026, 7:42:26 AM ERROR [ExecutorService] Object:
{
"executionId": "execution-7",
"organizationId": "org-7",
"outcome": "failure",
"errorMessage": "No start state found for workflow definition workflow-7",  
 "attemptNumber": 1
}

[Nest] 66380 - 01/22/2026, 7:42:26 AM ERROR [ExecutorService] Failed to process execution execution-7 (org: org-7)  
Error: No start state found for workflow definition workflow-7
at ExecutorService.getStartStateId (D:\Basaan os\BassanOs\backend\src\modules\executor\executor.service.ts:357:13)
at ExecutorService.processSingleExecution (D:\Basaan os\BassanOs\backend\src\modules\executor\executor.service.ts:263:29)
at D:\Basaan os\BassanOs\backend\src\modules\executor\executor.service.ts:141:19
at ExecutorService.processDueExecutions (D:\Basaan os\BassanOs\backend\src\modules\executor\executor.service.ts:110:11)
at Object.<anonymous> (D:\Basaan os\BassanOs\backend\tests\unit\executor.service.spec.ts:406:22)
PASS tests/unit/executor.service.spec.ts
[Nest] 66380 - 01/22/2026, 7:42:26 AM ERROR [SchedulerService] Object:  
{
"triggerId": "trigger-7",
"organizationId": "org-7",
"outcome": "failure",
"errorMessage": "Failed to create deferred execution: DB error"
}

[Nest] 66380 - 01/22/2026, 7:42:26 AM ERROR [SchedulerService] Failed to process trigger trigger-7 (org: org-7)
Error: DB error
at Object.<anonymous> (D:\Basaan os\BassanOs\backend\tests\unit\scheduler.service.spec.ts:332:9)
at Promise.then.completed (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\utils.js:298:28)
at new Promise (<anonymous>)
at callAsyncCircusFn (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\utils.js:231:10)
at \_callCircusTest (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:316:40)
at \_runTest (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:252:3)
at \_runTestsForDescribeBlock (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:126:9)
at \_runTestsForDescribeBlock (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:121:9)
at \_runTestsForDescribeBlock (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:121:9)
at run (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\run.js:71:3)
at runAndTransformResultsToJestFormat (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\legacy-code-todo-rewrite\jestAdapterInit.js:122:21)  
 at jestAdapter (D:\Basaan os\BassanOs\backend\node_modules\jest-circus\build\legacy-code-todo-rewrite\jestAdapter.js:79:19)
at runTestInternal (D:\Basaan os\BassanOs\backend\node_modules\jest-runner\build\runTest.js:367:16)
at runTest (D:\Basaan os\BassanOs\backend\node_modules\jest-runner\build\runTest.js:444:34)
PASS tests/unit/scheduler.service.spec.ts

Test Suites: 12 passed, 12 total  
Tests: 5 skipped, 138 passed, 143 total
Snapshots: 0 total
Time: 81.432 s
Ran all test suites.
PS D:\Basaan os\BassanOs\backend> npm run test:e2e -- --runInBand

> bassan-backend@0.0.1 test:e2e
> jest --config jest-e2e.config.js --runInBand

PASS tests/security/penetration.e2e-spec.ts (18.277 s)
🔓 Security Penetration Tests
🎯 IDOR Attacks (Insecure Direct Object Reference)  
 √ ATTACK: Access victim workflow by directly using their ID (878 ms)  
 √ ATTACK: Update victim workflow by directly using their ID (703 ms)  
 √ ATTACK: Attempt to access victim workflow states (nested IDOR) (728 ms)
💉 organizationId Injection Attacks  
 √ ATTACK: Inject victim orgId in request body (768 ms)  
 √ ATTACK: Inject victim orgId in query string (714 ms)  
 🔐 Authentication Bypass Attacks  
 √ ATTACK: Access without authentication (740 ms)  
 √ ATTACK: Use invalid/expired token (713 ms)  
 √ ATTACK: Modify token payload to access victim org (739 ms)  
 📊 Data Enumeration Prevention  
 √ Should return 404 (not 403) for non-existent resources (715 ms)  
 √ Should return 404 (not 403) for other org resources (721 ms)  
 ✅ Legitimate Access (Control Tests)  
 √ Victim CAN access their own workflow (809 ms)  
 √ Victim CAN list their own workflows (748 ms)  
 √ Victim CAN update their own workflow (757 ms)

Test Suites: 1 passed, 1 total  
Tests: 13 passed, 13 total  
Snapshots: 0 total
Time: 18.968 s
Ran all test suites.
PS D:\Basaan os\BassanOs\backend>
package.json unchanged
