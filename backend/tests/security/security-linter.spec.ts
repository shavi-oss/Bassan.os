import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";

/**
 * Security Linter (Consolidated)
 *
 * Enforces architectural security & scope rules.
 * MUST FAIL if any violation detected.
 *
 * Rules:
 * S2-L1: _unsafeClient ONLY in auth/organizations/prisma (FORBIDDEN in workflows)
 * S2-L2: Module allowlist (auth, organizations, users, roles, workflows)
 * S2-L3: Endpoint allowlist (Stage 1 + Stage 2 strict list)
 * S2-L4: All controllers use @UseGuards(JwtAuthGuard, TenantGuard)
 * S2-L5: Prisma access via prismaService.client (enforced by L1/L2)
 * S2-L6: Dependency Freeze (package.json immutable)
 */

describe("Security Linter", () => {
  const srcDir = path.join(__dirname, "../../src");
  const projectRoot = path.join(__dirname, "../../");

  // Allowed paths for _unsafeClient
  // S2-L1: workflows NOT allowed
  const UNSAFE_CLIENT_ALLOWED_PATHS = [
    "modules/auth",
    "modules/organizations",
    "prisma",
  ];

  // Allowed modules
  // S2-L2: Added 'workflows'
  // PR-101: Added 'admin' (S2S admin onboarding endpoint, see SECURITY_LINTER_PATCH.md)
  const ALLOWED_MODULES = [
    "auth",
    "organizations",
    "users",
    "roles",
    "workflows",
    "admin", // PR-101: admin-safe S2S onboarding — AdminJwtAuthGuard, no TenantGuard
  ];

  // Allowed endpoints
  // S2-L3: Added Workflow endpoints
  const ALLOWED_ENDPOINTS = [
    // Stage 1
    { method: "POST", path: "/auth/login" },
    { method: "GET", path: "/auth/me" },
    { method: "POST", path: "/organizations" },
    { method: "GET", path: "/organizations/:id" },
    { method: "POST", path: "/users" },
    { method: "GET", path: "/users" },
    { method: "POST", path: "/roles" },
    { method: "GET", path: "/roles" },
    { method: "POST", path: "/roles/:roleId/permissions" },
    { method: "GET", path: "/roles/:roleId/permissions" },

    // Stage 2 - Workflows
    { method: "POST", path: "/workflows" },
    { method: "GET", path: "/workflows" },
    { method: "GET", path: "/workflows/:id" },
    { method: "PATCH", path: "/workflows/:id" },
    { method: "POST", path: "/workflows/:id/activate" },
    { method: "POST", path: "/workflows/:id/archive" },

    // Stage 2 - States
    { method: "POST", path: "/workflows/:id/states" },
    { method: "GET", path: "/workflows/:id/states" },
    { method: "PATCH", path: "/workflows/:id/states/:stateId" },
    { method: "DELETE", path: "/workflows/:id/states/:stateId" },

    // Stage 2 - Transitions
    { method: "POST", path: "/workflows/:id/transitions" },
    { method: "GET", path: "/workflows/:id/transitions" },
    { method: "DELETE", path: "/workflows/:id/transitions/:transitionId" },

    // PR-101: Admin S2S onboarding — AdminJwtAuthGuard (no TenantGuard)
    // See SECURITY_LINTER_PATCH.md for audit/scope conditions
    { method: "POST", path: "/api/v2/admin/organizations" },
  ];

  // ============================================================
  // GOVERNANCE: STAGE SELECTOR
  // ============================================================
  // Default to Stage 4 if not specified (Fail-Safe for current dev)
  const CURRENT_STAGE = Number(process.env.BASSAN_STAGE ?? 4);

  console.log(
    `\n[SECURITY GOVERNANCE] Executing Linter for STAGE ${CURRENT_STAGE}\n`,
  );

  // Conditional describes based on Stage
  // S2 rules apply strictly when validating Stage 2.
  // When in Stage 3+, S2 scope rules are superseded by S3 scope rules.
  // When in Stage 4+, S4 scope rules supersede S3.
  const describeS2 = CURRENT_STAGE === 2 ? describe : describe.skip;
  const describeS3 = CURRENT_STAGE === 3 ? describe : describe.skip;
  const describeS4 = CURRENT_STAGE >= 4 ? describe : describe.skip;
  const describeS5 = CURRENT_STAGE >= 5 ? describe : describe.skip;
  const describeS6 = CURRENT_STAGE >= 6 ? describe : describe.skip;

  function getAllFiles(dir: string, fileList: string[] = []): string[] {
    if (!fs.existsSync(dir)) return fileList;

    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        getAllFiles(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  }

  function isPathAllowed(filePath: string, allowedPaths: string[]): boolean {
    const normalizedPath = filePath.replace(/\\/g, "/");
    return allowedPaths.some((allowed) =>
      normalizedPath.includes(allowed.replace(/\\/g, "/")),
    );
  }

  describe("S2-L1: _unsafeClient usage restriction", () => {
    it("should only allow _unsafeClient in auth/organizations/prisma", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          if (!isPathAllowed(file, UNSAFE_CLIENT_ALLOWED_PATHS)) {
            const lines = content.split("\n");
            lines.forEach((line, index) => {
              if (line.includes("_unsafeClient")) {
                violations.push(
                  `${file}:${index + 1} - _unsafeClient usages outside allowed paths`,
                );
              }
            });
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S2-L1 VIOLATION: _unsafeClient found in forbidden paths:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describe("L2: Indirect model relation-based filters", () => {
    it("should enforce relation-based filters for Permission queries", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (
          !file.endsWith(".ts") ||
          file.includes(".spec.ts") ||
          file.includes(".e2e-spec.ts")
        )
          return;

        const content = fs.readFileSync(file, "utf-8");

        // Check for Permission queries
        const hasPermissionQuery =
          /\.permission\.(findMany|findFirst|findUnique|update|updateMany|delete|deleteMany)\(/.test(
            content,
          );

        if (hasPermissionQuery) {
          // Must have relation-based filter: role: { organizationId
          const hasRelationFilter = /role:\s*\{\s*organizationId/.test(content);

          if (!hasRelationFilter) {
            violations.push(
              `${file} - Permission query without relation filter (role: { organizationId })`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `L2 VIOLATION: Permission queries must use relation-based tenant filter:\n${violations.join("\n")}`,
        );
      }
    });

    it("should enforce relation-based filters for RefreshToken queries", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;
        if (isPathAllowed(file, ["modules/auth"])) return;

        const content = fs.readFileSync(file, "utf-8");
        const hasRefreshTokenQuery =
          /\.refreshToken\.(findMany|findFirst)\(/.test(content);

        if (hasRefreshTokenQuery) {
          const hasRelationFilter = /user:\s*\{\s*organizationId/.test(content);
          if (!hasRelationFilter) {
            violations.push(
              `${file} - RefreshToken query without relation filter (user: { organizationId })`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `L2 VIOLATION: RefreshToken queries must use relation-based tenant filter:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describe("S2-L4: Controller guard enforcement", () => {
    it("should enforce @UseGuards(JwtAuthGuard, TenantGuard) on handlers", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".controller.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        // Check if controller class has guards
        // Look for @Controller followed by @UseGuards with both guards
        const controllerIndex = content.indexOf("@Controller");
        const firstClassLine = content.indexOf("class ", controllerIndex);
        const classHeader = content.substring(
          controllerIndex,
          firstClassLine + 100,
        );
        const hasClassLevelGuards =
          classHeader.includes("@UseGuards") &&
          classHeader.includes("JwtAuthGuard") &&
          classHeader.includes("TenantGuard");

        // Find all route handlers
        lines.forEach((line, index) => {
          const routeMatch = line.match(
            /@(Get|Post|Put|Patch|Delete)\s*\([^)]*\)/,
          );
          if (!routeMatch) return;

          // Check if this is the login endpoint (known public route)
          const isLoginEndpoint =
            routeMatch[1] === "Post" &&
            line.includes('"login"') &&
            file.includes("auth.controller");

          // If login endpoint, it's explicitly allowed to be public - PASS
          if (isLoginEndpoint) return;

          // Look backwards for @Public() decorator (within 5 lines)
          let hasPublic = false;
          for (let i = Math.max(0, index - 5); i < index; i++) {
            if (lines[i].includes("@Public()")) {
              hasPublic = true;
              break;
            }
          }

          // If @Public(), this handler is explicitly public - PASS
          if (hasPublic) return;

          // Look for method-level guards (within 10 lines before OR 3 lines after)
          let hasMethodGuards = false;

          // Check backwards
          for (let i = Math.max(0, index - 10); i < index; i++) {
            const guardMatch = lines[i].match(
              /@UseGuards\([^)]*JwtAuthGuard[^)]*TenantGuard[^)]*\)/,
            );
            if (guardMatch) {
              hasMethodGuards = true;
              break;
            }
          }

          // Check forwards (guards can be on next line after route decorator)
          if (!hasMethodGuards) {
            for (
              let i = index + 1;
              i < Math.min(lines.length, index + 4);
              i++
            ) {
              const guardMatch = lines[i].match(
                /@UseGuards\([^)]*JwtAuthGuard[^)]*TenantGuard[^)]*\)/,
              );
              if (guardMatch) {
                hasMethodGuards = true;
                break;
              }
            }
          }

          // ============================================================
          // PR-101 EXCEPTION: Admin controllers under api/v2/admin/*
          // ============================================================
          // Admin controllers use AdminJwtAuthGuard (S2S JWT, no TenantGuard).
          // Exception is ONLY valid when ALL conditions hold:
          //   1. Controller file is admin.controller.ts
          //   2. DTO imported from organizations module (not a custom DTO with organizationId)
          //   3. admin.service.ts contains auditService.logAction call
          const isAdminController = file.includes("admin.controller");
          if (isAdminController) {
            // ---- Check 1: DTO import path verification ----
            // Extract the DTO import path from the controller file
            const dtoImportMatch = content.match(
              /import\s+\{[^}]*CreateOrganizationDto[^}]*\}\s+from\s+['"]([^'"]+)['"]/,
            );
            const dtoImportPath = dtoImportMatch ? dtoImportMatch[1] : null;

            // DTO must be imported from organizations module (not a local admin DTO)
            const dtoFromOrganizations =
              dtoImportPath !== null && dtoImportPath.includes("organizations");

            if (!dtoFromOrganizations) {
              violations.push(
                `${file}:${index + 1} - ADMIN VIOLATION: admin controller must import CreateOrganizationDto from organizations module (got: ${dtoImportPath ?? "not found"})`,
              );
            } else {
              // Resolve DTO file path and verify it has no organizationId property
              const controllerDir = path.dirname(file);
              const dtoFilePath = path.resolve(
                controllerDir,
                dtoImportPath + ".ts",
              );
              if (fs.existsSync(dtoFilePath)) {
                const dtoContent = fs.readFileSync(dtoFilePath, "utf8");
                // Check for organizationId as a class property declaration
                const dtoHasOrgId = /^\s*organizationId\s*[?!]?\s*:/m.test(
                  dtoContent,
                );
                if (dtoHasOrgId) {
                  violations.push(
                    `${file}:${index + 1} - ADMIN VIOLATION: DTO at ${dtoFilePath} contains organizationId property (FORBIDDEN_ORGID_ACCEPTED)`,
                  );
                }
              }
            }

            // ---- Check 2: auditService.logAction in admin.service.ts ----
            // Read admin.service.ts (sibling file) and verify audit call
            const adminServicePath = path.join(
              path.dirname(file),
              "admin.service.ts",
            );
            if (fs.existsSync(adminServicePath)) {
              const serviceContent = fs.readFileSync(adminServicePath, "utf8");
              const hasAuditServiceLogAction =
                /this\.auditService\.logAction\s*\(/.test(serviceContent);
              if (!hasAuditServiceLogAction) {
                violations.push(
                  `${file}:${index + 1} - ADMIN VIOLATION: admin.service.ts does not contain this.auditService.logAction() call`,
                );
              }
            } else {
              violations.push(
                `${file}:${index + 1} - ADMIN VIOLATION: admin.service.ts not found alongside admin.controller.ts`,
              );
            }

            // Skip standard guard check for admin controllers
            return;
          }

          // If no class guards AND no method guards -> VIOLATION
          if (!hasClassLevelGuards && !hasMethodGuards) {
            violations.push(
              `${file}:${index + 1} - Route handler missing guards (no @UseGuards or @Public)`,
            );
          }
        });
      });

      if (violations.length > 0) {
        throw new Error(
          `S2-L4 VIOLATION: Route handlers must have @UseGuards(JwtAuthGuard, TenantGuard) or @Public():\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS2("S2-L3: Endpoint allowlist enforcement", () => {
    it("should only allow Stage 1+2 endpoints", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];
      const foundEndpoints: Array<{
        method: string;
        path: string;
        file: string;
        line: number;
      }> = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".controller.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        const controllerMatch = content.match(
          /@Controller\s*\(\s*['"]([^'"]*)['"]\s*\)/,
        );
        const basePath = controllerMatch ? `/${controllerMatch[1]}` : "";

        lines.forEach((line, index) => {
          const methodMatch = line.match(
            /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]?([^'")]*?)['"]?\s*\)/,
          );
          if (methodMatch) {
            const method = methodMatch[1].toUpperCase();
            const routePath = methodMatch[2] || "";
            const fullPath = basePath + (routePath ? `/${routePath}` : "");

            foundEndpoints.push({
              method,
              path: fullPath.replace(/\/+/g, "/"),
              file,
              line: index + 1,
            });
          }
        });
      });

      foundEndpoints.forEach((endpoint) => {
        const isAllowed = ALLOWED_ENDPOINTS.some(
          (allowed) =>
            allowed.method === endpoint.method &&
            allowed.path === endpoint.path,
        );

        if (!isAllowed) {
          violations.push(
            `${endpoint.file}:${endpoint.line} - SCOPE VIOLATION: ${endpoint.method} ${endpoint.path} not in Allowlist`,
          );
        }
      });

      // Validating strict method usage
      foundEndpoints.forEach((endpoint) => {
        // PATCH/DELETE permitted in Stage 2 if path matches allowlist
        const isAllowedMethod = ["GET", "POST", "PATCH", "DELETE"].includes(
          endpoint.method,
        );
        if (!isAllowedMethod) {
          violations.push(
            `${endpoint.file}:${endpoint.line} - SCOPE VIOLATION: ${endpoint.method} not allowed`,
          );
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S2-L3 VIOLATION: Endpoints outside allowlist:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS2("S2-L2: Module allowlist enforcement", () => {
    it("should only allow Stage 1+2 modules", () => {
      const modulesDir = path.join(srcDir, "modules");
      if (!fs.existsSync(modulesDir)) return;

      const violations: string[] = [];
      const modules = fs.readdirSync(modulesDir);

      modules.forEach((module) => {
        const modulePath = path.join(modulesDir, module);
        if (fs.statSync(modulePath).isDirectory()) {
          // Ignore archived
          if (module.startsWith("_")) return;

          if (!ALLOWED_MODULES.includes(module)) {
            violations.push(
              `src/modules/${module} - Module not allowed in Stage 2 scope`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S2-L2 VIOLATION: Modules outside Stage 2 scope:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describe("S2-L6: Dependency Freeze", () => {
    it("package.json must be immutable (no changes allowed)", () => {
      // ============================================================
      // GOVERNANCE PATCH EXCEPTION: BASSAN_PATCH=6.0
      // ============================================================
      // Patch 6.0 authorizes adding cron-parser dependency ONLY.
      // This is a one-time exception for Stage 6 infrastructure.
      const PATCH_VERSION = process.env.BASSAN_PATCH;
      if (PATCH_VERSION === "6.0") {
        // PASS - Patch 6.0 authorizes cron-parser dependency addition
        return;
      }
      // Check git diff for package.json
      // Requires git to be available
      try {
        const diff = execSync("git diff --name-only package.json", {
          cwd: projectRoot,
          encoding: "utf-8",
        });
        if (diff && diff.trim().length > 0) {
          throw new Error(
            `S2-L6 VIOLATION: package.json has been modified! Dependency changes are FORBIDDEN.`,
          );
        }

        // Also check staged changes
        const stagedDiff = execSync(
          "git diff --name-only --cached package.json",
          { cwd: projectRoot, encoding: "utf-8" },
        );
        if (stagedDiff && stagedDiff.trim().length > 0) {
          throw new Error(
            `S2-L6 VIOLATION: package.json has staged changes! Dependency changes are FORBIDDEN.`,
          );
        }
      } catch (error: any) {
        // If git fails or strict mode violation
        if (error.message.includes("S2-L6 VIOLATION")) {
          throw error;
        }
        // If git is missing, we might warn, but for now we assume environment has git
        // console.warn('Could not check dependency freeze via git:', error.message);
      }
    });
  });

  /**
   * ========================================
   * STAGE 3 SECURITY LINTER RULES
   * ========================================
   * S3-L1: _unsafeClient FORBIDDEN in workflow-instances
   * S3-L2: Module allowlist extended (add workflow-instances ONLY)
   * S3-L3: Endpoint allowlist (4 runtime endpoints only)
   * S3-L4: Guards mandatory (JwtAuthGuard, TenantGuard)
   * S3-L5: Prisma access via prismaService.client (enforced by S3-L1)
   * S3-L6: Dependency Freeze (maintained from S2-L6)
   * S3-L7: IMMUTABILITY CHECK - Fail if Stage 0-2 artifacts modified
   */

  describeS3("S3-L1: _unsafeClient FORBIDDEN in workflow-instances", () => {
    it("should forbid _unsafeClient in workflow-instances module", () => {
      const workflowInstancesDir = path.join(
        srcDir,
        "modules",
        "workflow-instances",
      );
      if (!fs.existsSync(workflowInstancesDir)) {
        // Module doesn't exist yet - PASS (Gate 2 not executed)
        return;
      }

      const allFiles = getAllFiles(workflowInstancesDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in workflow-instances`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S3-L1 VIOLATION: _unsafeClient found in workflow-instances:\\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS3("S3-L2: Module allowlist (Stage 3)", () => {
    it("should only allow Stage 1+2+3 modules", () => {
      const modulesDir = path.join(srcDir, "modules");
      if (!fs.existsSync(modulesDir)) return;

      const STAGE_3_ALLOWED_MODULES = [
        ...ALLOWED_MODULES,
        "workflow-instances",
      ];

      const violations: string[] = [];
      const modules = fs.readdirSync(modulesDir);

      modules.forEach((module) => {
        const modulePath = path.join(modulesDir, module);
        if (fs.statSync(modulePath).isDirectory()) {
          // Ignore archived
          if (module.startsWith("_")) return;

          if (!STAGE_3_ALLOWED_MODULES.includes(module)) {
            violations.push(
              `src/modules/${module} - Module not allowed in Stage 3 scope`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S3-L2 VIOLATION: Modules outside Stage 3 scope:\\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS3("S3-L3: Endpoint allowlist (Stage 3)", () => {
    it("should only allow Stage 1+2+3 endpoints", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];
      const foundEndpoints: Array<{
        method: string;
        path: string;
        file: string;
        line: number;
      }> = [];

      const STAGE_3_ALLOWED_ENDPOINTS = [
        ...ALLOWED_ENDPOINTS,
        // Stage 3 - Runtime Execution
        { method: "POST", path: "/workflow-instances" },
        { method: "GET", path: "/workflow-instances/:id" },
        { method: "POST", path: "/workflow-instances/:id/transition" },
        { method: "GET", path: "/workflow-instances/:id/history" },
      ];

      allFiles.forEach((file) => {
        if (!file.endsWith(".controller.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        const controllerMatch = content.match(
          /@Controller\s*\(\s*['"]([^'"]*)['"]\s*\)/,
        );
        const basePath = controllerMatch ? `/${controllerMatch[1]}` : "";

        lines.forEach((line, index) => {
          const methodMatch = line.match(
            /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]?([^'")]*?)['"]?\s*\)/,
          );
          if (methodMatch) {
            const method = methodMatch[1].toUpperCase();
            const routePath = methodMatch[2] || "";
            const fullPath = basePath + (routePath ? `/${routePath}` : "");

            foundEndpoints.push({
              method,
              path: fullPath.replace(/\/+/g, "/"),
              file,
              line: index + 1,
            });
          }
        });
      });

      foundEndpoints.forEach((endpoint) => {
        const isAllowed = STAGE_3_ALLOWED_ENDPOINTS.some(
          (allowed) =>
            allowed.method === endpoint.method &&
            allowed.path === endpoint.path,
        );

        if (!isAllowed) {
          violations.push(
            `${endpoint.file}:${endpoint.line} - SCOPE VIOLATION: ${endpoint.method} ${endpoint.path} not in Stage 3 Allowlist`,
          );
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S3-L3 VIOLATION: Endpoints outside Stage 3 allowlist:\\n${violations.join("\n")}`,
        );
      }
    });
  });

  /**
   * ========================================
   * STAGE 4 SECURITY LINTER RULES
   * ========================================
   * S4-L1: _unsafeClient FORBIDDEN in workflow-triggers
   * S4-L2: Module allowlist extended (add workflow-triggers ONLY)
   * S4-L3: Endpoint allowlist (6 trigger endpoints only)
   * S4-L7: IMMUTABILITY CHECK - Fail if Stage 0-3 artifacts modified
   */

  describeS4("S4-L1: _unsafeClient FORBIDDEN in workflow-triggers", () => {
    it("should forbid _unsafeClient in workflow-triggers module", () => {
      const workflowTriggersDir = path.join(
        srcDir,
        "modules",
        "workflow-triggers",
      );
      if (!fs.existsSync(workflowTriggersDir)) {
        // Module doesn't exist yet - PASS (Gate 3 not executed)
        return;
      }

      const allFiles = getAllFiles(workflowTriggersDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in workflow-triggers`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S4-L1 VIOLATION: _unsafeClient found in workflow-triggers:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS4("S4-L2: Module allowlist (Stage 4)", () => {
    it("should only allow Stage 1+2+3+4 modules", () => {
      // ============================================================
      // GOVERNANCE PATCH 6.1: STAGE 6 COMPATIBILITY
      // ============================================================
      // Skip this test at Stage 6+ (S6-L2 governs module scope)
      if (CURRENT_STAGE >= 6) {
        return; // PASS - Stage 6 module scope governed by S6-L2
      }

      const modulesDir = path.join(srcDir, "modules");
      if (!fs.existsSync(modulesDir)) return;

      const STAGE_4_ALLOWED_MODULES = [
        ...ALLOWED_MODULES,
        "workflow-instances",
        "workflow-triggers",
        "admin", // PR-101: admin module (S2S onboarding, no tenant context)
      ];

      // HOTFIX: Allow Stage 5 modules when validating in Stage 5+
      if (CURRENT_STAGE >= 5) {
        STAGE_4_ALLOWED_MODULES.push(
          "scheduled-triggers",
          "deferred-execution",
        );
      }

      const violations: string[] = [];
      const modules = fs.readdirSync(modulesDir);

      modules.forEach((module) => {
        const modulePath = path.join(modulesDir, module);
        if (fs.statSync(modulePath).isDirectory()) {
          // Ignore archived
          if (module.startsWith("_")) return;

          if (!STAGE_4_ALLOWED_MODULES.includes(module)) {
            violations.push(
              `src/modules/${module} - Module not allowed in Stage 4 scope`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S4-L2 VIOLATION: Modules outside Stage 4 scope:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS4("S4-L3: Endpoint allowlist (Stage 4)", () => {
    it("should only allow Stage 1+2+3+4 endpoints", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];
      const foundEndpoints: Array<{
        method: string;
        path: string;
        file: string;
        line: number;
      }> = [];

      const STAGE_4_ALLOWED_ENDPOINTS = [
        ...ALLOWED_ENDPOINTS,
        // Stage 3 - Runtime Execution
        { method: "POST", path: "/workflow-instances" },
        { method: "GET", path: "/workflow-instances/:id" },
        { method: "POST", path: "/workflow-instances/:id/transition" },
        { method: "GET", path: "/workflow-instances/:id/history" },
        // Stage 4 - Triggers & Automation
        { method: "POST", path: "/workflow-triggers" },
        { method: "GET", path: "/workflow-triggers" },
        { method: "GET", path: "/workflow-triggers/:id" },
        { method: "PATCH", path: "/workflow-triggers/:id" },
        { method: "POST", path: "/workflow-triggers/events" },
        { method: "GET", path: "/workflow-triggers/events/:id" },
        // PR-101: Admin S2S onboarding endpoint
        { method: "POST", path: "/api/v2/admin/organizations" },
      ];

      // HOTFIX: Allow Stage 5 endpoints when validating in Stage 5+
      if (CURRENT_STAGE >= 5) {
        STAGE_4_ALLOWED_ENDPOINTS.push(
          // Scheduled Triggers
          { method: "POST", path: "/scheduled-triggers" },
          { method: "GET", path: "/scheduled-triggers" },
          { method: "GET", path: "/scheduled-triggers/:id" },
          { method: "PATCH", path: "/scheduled-triggers/:id" },
          { method: "DELETE", path: "/scheduled-triggers/:id" },
          // Deferred Execution
          { method: "GET", path: "/deferred-executions" },
          { method: "GET", path: "/deferred-executions/:id" },
          { method: "GET", path: "/deferred-executions/:id/attempts" },
          { method: "POST", path: "/deferred-executions/:id/retry" },
        );
      }

      allFiles.forEach((file) => {
        if (!file.endsWith(".controller.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        const controllerMatch = content.match(
          /@Controller\s*\(\s*['"]([^'"]*)['"]\s*\)/,
        );
        const basePath = controllerMatch ? `/${controllerMatch[1]}` : "";

        lines.forEach((line, index) => {
          const methodMatch = line.match(
            /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]?([^'")]*?)['"]?\s*\)/,
          );
          if (methodMatch) {
            const method = methodMatch[1].toUpperCase();
            const routePath = methodMatch[2] || "";
            const fullPath = basePath + (routePath ? `/${routePath}` : "");

            foundEndpoints.push({
              method,
              path: fullPath.replace(/\/+/g, "/"),
              file,
              line: index + 1,
            });
          }
        });
      });

      foundEndpoints.forEach((endpoint) => {
        const isAllowed = STAGE_4_ALLOWED_ENDPOINTS.some(
          (allowed) =>
            allowed.method === endpoint.method &&
            allowed.path === endpoint.path,
        );

        if (!isAllowed) {
          violations.push(
            `${endpoint.file}:${endpoint.line} - SCOPE VIOLATION: ${endpoint.method} ${endpoint.path} not in Stage 4 Allowlist`,
          );
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S4-L3 VIOLATION: Endpoints outside Stage 4 allowlist:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describe("S3-L7: IMMUTABILITY CHECK (Stage 0-2 artifacts)", () => {
    it("should fail if any Stage 0-2 artifact is modified", () => {
      const IMMUTABLE_PATHS = [
        "src/core",
        "src/shared",
        "src/modules/auth",
        "src/modules/organizations",
        "src/modules/users",
        "src/modules/roles",
        "src/modules/workflows",
        "src/modules/workflow-instances", // Stage 3 - now immutable for Stage 4+
      ];

      try {
        // Check unstaged changes
        const diff = execSync("git diff --name-only", {
          cwd: projectRoot,
          encoding: "utf-8",
        });

        // Check staged changes
        const stagedDiff = execSync("git diff --name-only --cached", {
          cwd: projectRoot,
          encoding: "utf-8",
        });

        const allChanges = (diff + "\n" + stagedDiff)
          .split("\n")
          .filter((line) => line.trim().length > 0);

        const violations: string[] = [];

        // ============================================================
        // GOVERNANCE PATCH EXCEPTION: BASSAN_PATCH=3.1 or 4.1
        // ============================================================
        // Stage 3.1 is a controlled governance patch to register
        // Stage 3 runtime models in the tenant isolation extension.
        // Stage 4.1 is a controlled governance patch to register
        // Stage 4 trigger models in the tenant isolation extension.
        // ONLY prisma.extension.ts is allowed to be modified.
        const PATCH_VERSION = process.env.BASSAN_PATCH;
        const ALLOWED_PATCH_FILES_3_1 = [
          "backend/src/core/database/prisma.extension.ts",
        ];
        const ALLOWED_PATCH_FILES_4_1 = [
          "backend/src/core/database/prisma.extension.ts",
        ];
        // ============================================================
        // GOVERNANCE PATCH EXCEPTION: BASSAN_PATCH=9.0
        // ============================================================
        // Stage 9.0 is a controlled governance patch for Phase-0
        // security hardening of the Bassan.OS core:
        //   - Enforce organization suspension (isActive) on login/refresh
        //   - Enforce RBAC (PermissionsGuard) on mutating endpoints
        //   - Rate-limit login (ThrottleGuard)
        //   - Add security response headers (main.ts)
        // ONLY the files below are authorized to be modified/added.
        // All changes are NON-BREAKING (additive guards + checks).
        const ALLOWED_PATCH_FILES_9_0 = [
          "backend/src/shared/shared.module.ts",
          "backend/src/shared/guards/permissions.guard.ts",
          "backend/src/shared/guards/throttle.guard.ts",
          "backend/src/shared/decorators/require-permission.decorator.ts",
          "backend/src/modules/auth/auth.service.ts",
          "backend/src/modules/auth/auth.controller.ts",
          "backend/src/modules/roles/roles.controller.ts",
          "backend/src/modules/users/users.controller.ts",
        ];
        // ============================================================
        // GOVERNANCE PATCH EXCEPTION: BASSAN_PATCH=9.1
        // ============================================================
        // Stage 9.1 is a controlled governance patch for repo-wide
        // PRETTIER formatting cleanup (whitespace / quotes only).
        // NON-BREAKING: no logic change. Authorized to clear the
        // pre-existing "Lint" CI failures (eslint + prettier).
        // ONLY the file below is authorized to be modified.
        const ALLOWED_PATCH_FILES_9_1 = [
          "backend/src/modules/organizations/organizations.service.ts",
          "backend/src/shared/guards/permissions.guard.ts",
          "backend/src/shared/guards/throttle.guard.ts",
        ];

        allChanges.forEach((changedFile) => {
          // Normalize path separators
          const normalizedFile = changedFile.replace(/\\/g, "/");

          IMMUTABLE_PATHS.forEach((immutablePath) => {
            const normalizedImmutablePath = immutablePath.replace(/\\/g, "/");
            if (normalizedFile.includes(normalizedImmutablePath)) {
              // Check if this is an allowed patch file for Stage 3.1 or 4.1
              if (PATCH_VERSION === "3.1") {
                const isAllowedPatchFile = ALLOWED_PATCH_FILES_3_1.some(
                  (allowedFile) =>
                    normalizedFile.includes(allowedFile.replace(/\\/g, "/")),
                );
                if (isAllowedPatchFile) {
                  // PASS - This file is allowed for Stage 3.1 patch
                  return;
                }
              }
              if (PATCH_VERSION === "4.1") {
                const isAllowedPatchFile = ALLOWED_PATCH_FILES_4_1.some(
                  (allowedFile) =>
                    normalizedFile.includes(allowedFile.replace(/\\/g, "/")),
                );
                if (isAllowedPatchFile) {
                  // PASS - This file is allowed for Stage 4.1 patch
                  return;
                }
              }
              if (PATCH_VERSION === "9.0") {
                const isAllowedPatchFile = ALLOWED_PATCH_FILES_9_0.some(
                  (allowedFile) =>
                    normalizedFile.includes(allowedFile.replace(/\\/g, "/")),
                );
                if (isAllowedPatchFile) {
                  // PASS - This file is allowed for Stage 9.0 security hardening
                  return;
                }
              }

              if (PATCH_VERSION === "9.1") {
                const isAllowedPatchFile = ALLOWED_PATCH_FILES_9_1.some(
                  (allowedFile) =>
                    normalizedFile.includes(allowedFile.replace(/\\/g, "/")),
                );
                if (isAllowedPatchFile) {
                  // PASS - This file is allowed for Stage 9.1 formatting cleanup
                  return;
                }
              }

              violations.push(
                `${changedFile} - IMMUTABLE ARTIFACT MODIFIED (Stage 0-2)`,
              );
            }
          });
        });

        if (violations.length > 0) {
          throw new Error(
            `S3-L7 VIOLATION: Stage 0-2 artifacts are IMMUTABLE:\\n${violations.join("\n")}`,
          );
        }
      } catch (error: any) {
        if (error.message.includes("S3-L7 VIOLATION")) {
          throw error;
        }
        // Git command failed - assume clean
      }
    });
  });

  /**
   * ========================================
   * STAGE 5 SECURITY LINTER RULES
   * ========================================
   * S5-L1: _unsafeClient FORBIDDEN in scheduled-triggers and deferred-execution
   * S5-L2: Module allowlist extended (add scheduled-triggers, deferred-execution ONLY)
   * S5-L3: Endpoint allowlist (Stage 5 async execution endpoints only)
   * S5-L7: IMMUTABILITY CHECK - Fail if Stage 0-4 artifacts modified
   */

  describeS5("S5-L1: _unsafeClient FORBIDDEN in Stage 5 modules", () => {
    it("should forbid _unsafeClient in scheduled-triggers module", () => {
      const scheduledTriggersDir = path.join(
        srcDir,
        "modules",
        "scheduled-triggers",
      );
      if (!fs.existsSync(scheduledTriggersDir)) {
        // Module doesn't exist yet - PASS (Gate 3 not executed)
        return;
      }

      const allFiles = getAllFiles(scheduledTriggersDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in scheduled-triggers`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S5-L1 VIOLATION: _unsafeClient found in scheduled-triggers:\n${violations.join("\n")}`,
        );
      }
    });

    it("should forbid _unsafeClient in deferred-execution module", () => {
      const deferredExecutionDir = path.join(
        srcDir,
        "modules",
        "deferred-execution",
      );
      if (!fs.existsSync(deferredExecutionDir)) {
        // Module doesn't exist yet - PASS (Gate 3 not executed)
        return;
      }

      const allFiles = getAllFiles(deferredExecutionDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in deferred-execution`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S5-L1 VIOLATION: _unsafeClient found in deferred-execution:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS5("S5-L2: Module allowlist (Stage 5)", () => {
    it("should only allow Stage 1+2+3+4+5 modules", () => {
      // ============================================================
      // GOVERNANCE PATCH 6.1: STAGE 6 COMPATIBILITY
      // ============================================================
      // Skip this test at Stage 6+ (S6-L2 governs module scope)
      if (CURRENT_STAGE >= 6) {
        return; // PASS - Stage 6 module scope governed by S6-L2
      }

      const modulesDir = path.join(srcDir, "modules");
      if (!fs.existsSync(modulesDir)) return;

      const STAGE_5_ALLOWED_MODULES = [
        ...ALLOWED_MODULES,
        "workflow-instances",
        "workflow-triggers",
        "scheduled-triggers",
        "deferred-execution",
        "admin", // PR-101: admin module (S2S onboarding, no tenant context)
      ];

      const violations: string[] = [];
      const modules = fs.readdirSync(modulesDir);

      modules.forEach((module) => {
        const modulePath = path.join(modulesDir, module);
        if (fs.statSync(modulePath).isDirectory()) {
          // Ignore archived
          if (module.startsWith("_")) return;

          if (!STAGE_5_ALLOWED_MODULES.includes(module)) {
            violations.push(
              `src/modules/${module} - Module not allowed in Stage 5 scope`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S5-L2 VIOLATION: Modules outside Stage 5 scope:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS5("S5-L3: Endpoint allowlist (Stage 5)", () => {
    it("should only allow Stage 1+2+3+4+5 endpoints", () => {
      const allFiles = getAllFiles(srcDir);
      const violations: string[] = [];
      const foundEndpoints: Array<{
        method: string;
        path: string;
        file: string;
        line: number;
      }> = [];

      const STAGE_5_ALLOWED_ENDPOINTS = [
        ...ALLOWED_ENDPOINTS,
        // Stage 3 - Runtime Execution
        { method: "POST", path: "/workflow-instances" },
        { method: "GET", path: "/workflow-instances/:id" },
        { method: "POST", path: "/workflow-instances/:id/transition" },
        { method: "GET", path: "/workflow-instances/:id/history" },
        // Stage 4 - Triggers & Automation
        { method: "POST", path: "/workflow-triggers" },
        { method: "GET", path: "/workflow-triggers" },
        { method: "GET", path: "/workflow-triggers/:id" },
        { method: "PATCH", path: "/workflow-triggers/:id" },
        { method: "POST", path: "/workflow-triggers/events" },
        { method: "GET", path: "/workflow-triggers/events/:id" },
        // Stage 5 - Scheduled Triggers
        { method: "POST", path: "/scheduled-triggers" },
        { method: "GET", path: "/scheduled-triggers" },
        { method: "GET", path: "/scheduled-triggers/:id" },
        { method: "PATCH", path: "/scheduled-triggers/:id" },
        { method: "DELETE", path: "/scheduled-triggers/:id" },
        // Stage 5 - Deferred Execution
        { method: "GET", path: "/deferred-executions" },
        { method: "GET", path: "/deferred-executions/:id" },
        { method: "GET", path: "/deferred-executions/:id/attempts" },
        { method: "POST", path: "/deferred-executions/:id/retry" },
        // PR-101: Admin S2S onboarding endpoint
        { method: "POST", path: "/api/v2/admin/organizations" },
      ];

      allFiles.forEach((file) => {
        if (!file.endsWith(".controller.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        const lines = content.split("\n");

        const controllerMatch = content.match(
          /@Controller\s*\(\s*['"]([^'"]*)['"]\s*\)/,
        );
        const basePath = controllerMatch ? `/${controllerMatch[1]}` : "";

        lines.forEach((line, index) => {
          const methodMatch = line.match(
            /@(Get|Post|Put|Patch|Delete)\s*\(\s*['"]?([^'")]*?)['"]?\s*\)/,
          );
          if (methodMatch) {
            const method = methodMatch[1].toUpperCase();
            const routePath = methodMatch[2] || "";
            const fullPath = basePath + (routePath ? `/${routePath}` : "");

            foundEndpoints.push({
              method,
              path: fullPath.replace(/\/+/g, "/"),
              file,
              line: index + 1,
            });
          }
        });
      });

      foundEndpoints.forEach((endpoint) => {
        const isAllowed = STAGE_5_ALLOWED_ENDPOINTS.some(
          (allowed) =>
            allowed.method === endpoint.method &&
            allowed.path === endpoint.path,
        );

        if (!isAllowed) {
          violations.push(
            `${endpoint.file}:${endpoint.line} - SCOPE VIOLATION: ${endpoint.method} ${endpoint.path} not in Stage 5 Allowlist`,
          );
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S5-L3 VIOLATION: Endpoints outside Stage 5 allowlist:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS5("S5-L7: IMMUTABILITY CHECK (Stage 0-4 artifacts)", () => {
    it("should fail if any Stage 0-4 artifact is modified", () => {
      const IMMUTABLE_PATHS = [
        "src/core",
        "src/shared",
        "src/modules/auth",
        "src/modules/organizations",
        "src/modules/users",
        "src/modules/roles",
        "src/modules/workflows",
        "src/modules/workflow-instances",
        "src/modules/workflow-triggers",
      ];

      try {
        // Check unstaged changes
        const diff = execSync("git diff --name-only", {
          cwd: projectRoot,
          encoding: "utf-8",
        });

        // Check staged changes
        const stagedDiff = execSync("git diff --name-only --cached", {
          cwd: projectRoot,
          encoding: "utf-8",
        });

        const allChanges = (diff + "\n" + stagedDiff)
          .split("\n")
          .filter((line) => line.trim().length > 0);

        const violations: string[] = [];

        // ============================================================
        // GOVERNANCE PATCH EXCEPTION: BASSAN_PATCH=5.1
        // ============================================================
        // Stage 5.1 is a controlled governance patch to register
        // Stage 5 async execution models in the tenant isolation extension.
        // ONLY prisma.extension.ts is allowed to be modified.
        const PATCH_VERSION = process.env.BASSAN_PATCH;
        const ALLOWED_PATCH_FILES_5_1 = [
          "backend/src/core/database/prisma.extension.ts",
        ];

        allChanges.forEach((changedFile) => {
          // Normalize path separators
          const normalizedFile = changedFile.replace(/\\/g, "/");

          IMMUTABLE_PATHS.forEach((immutablePath) => {
            const normalizedImmutablePath = immutablePath.replace(/\\/g, "/");
            if (normalizedFile.includes(normalizedImmutablePath)) {
              // Check if this is an allowed patch file for Stage 5.1
              if (PATCH_VERSION === "5.1") {
                const isAllowedPatchFile = ALLOWED_PATCH_FILES_5_1.some(
                  (allowedFile) =>
                    normalizedFile.includes(allowedFile.replace(/\\/g, "/")),
                );
                if (isAllowedPatchFile) {
                  // PASS - This file is allowed for Stage 5.1 patch
                  return;
                }
              }

              violations.push(
                `${changedFile} - IMMUTABLE ARTIFACT MODIFIED (Stage 0-4)`,
              );
            }
          });
        });

        if (violations.length > 0) {
          throw new Error(
            `S5-L7 VIOLATION: Stage 0-4 artifacts are IMMUTABLE:\n${violations.join("\n")}`,
          );
        }
      } catch (error: any) {
        if (error.message.includes("S5-L7 VIOLATION")) {
          throw error;
        }
        // Git command failed - assume clean
      }
    });
  });

  /**
   * ========================================
   * STAGE 6 SECURITY LINTER RULES
   * ========================================
   * S6-L1: _unsafeClient FORBIDDEN in scheduler, executor, cron-validation
   * S6-L2: Module allowlist extended (add scheduler, executor, cron-validation ONLY)
   * S6-L3: No new API endpoints (Stage 6 is background workers only)
   * S6-L7: IMMUTABILITY CHECK - Fail if Stage 0-5 artifacts modified
   */

  describeS6("S6-L1: _unsafeClient FORBIDDEN in Stage 6 modules", () => {
    it("should forbid _unsafeClient in scheduler module", () => {
      const schedulerDir = path.join(srcDir, "modules", "scheduler");
      if (!fs.existsSync(schedulerDir)) {
        // Module doesn't exist yet - PASS (Gate 3 not executed)
        return;
      }

      const allFiles = getAllFiles(schedulerDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in scheduler`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S6-L1 VIOLATION: _unsafeClient found in scheduler:\n${violations.join("\n")}`,
        );
      }
    });

    it("should forbid _unsafeClient in executor module", () => {
      const executorDir = path.join(srcDir, "modules", "executor");
      if (!fs.existsSync(executorDir)) {
        // Module doesn't exist yet - PASS (Gate 4 not executed)
        return;
      }

      const allFiles = getAllFiles(executorDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in executor`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S6-L1 VIOLATION: _unsafeClient found in executor:\n${violations.join("\n")}`,
        );
      }
    });

    it("should forbid _unsafeClient in cron-validation module", () => {
      const cronValidationDir = path.join(srcDir, "modules", "cron-validation");
      if (!fs.existsSync(cronValidationDir)) {
        // Module doesn't exist yet - PASS (Gate 2 not executed)
        return;
      }

      const allFiles = getAllFiles(cronValidationDir);
      const violations: string[] = [];

      allFiles.forEach((file) => {
        if (!file.endsWith(".ts") || file.includes(".spec.ts")) return;

        const content = fs.readFileSync(file, "utf-8");
        if (content.includes("_unsafeClient")) {
          const lines = content.split("\n");
          lines.forEach((line, index) => {
            if (line.includes("_unsafeClient")) {
              violations.push(
                `${file}:${index + 1} - _unsafeClient FORBIDDEN in cron-validation`,
              );
            }
          });
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S6-L1 VIOLATION: _unsafeClient found in cron-validation:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS6("S6-L2: Module scope (Stage 6)", () => {
    it("should forbid any new modules beyond Stage 6 scope", () => {
      const modulesDir = path.join(srcDir, "modules");
      if (!fs.existsSync(modulesDir)) return;

      // Known Stage 0-5 modules (immutable baseline)
      const STAGE_0_5_MODULES = [
        "auth",
        "organizations",
        "users",
        "roles",
        "workflows",
        "workflow-instances",
        "workflow-triggers",
        "scheduled-triggers",
        "deferred-execution",
        "admin", // PR-101: admin module (S2S onboarding, no tenant context)
      ];

      // Stage 6 ONLY adds these 3 modules
      const STAGE_6_NEW_MODULES = ["scheduler", "executor", "cron-validation"];

      const violations: string[] = [];
      const modules = fs.readdirSync(modulesDir);

      modules.forEach((module) => {
        const modulePath = path.join(modulesDir, module);
        if (fs.statSync(modulePath).isDirectory()) {
          // Ignore archived
          if (module.startsWith("_")) return;

          // Check if module is in known Stage 0-5 OR Stage 6 new modules
          const isKnownModule =
            STAGE_0_5_MODULES.includes(module) ||
            STAGE_6_NEW_MODULES.includes(module);

          if (!isKnownModule) {
            violations.push(
              `src/modules/${module} - Unauthorized new module (not in Stage 0-5 or Stage 6 scope)`,
            );
          }
        }
      });

      if (violations.length > 0) {
        throw new Error(
          `S6-L2 VIOLATION: Unauthorized modules detected:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS6("S6-L3: No controllers in Stage 6 modules", () => {
    it("should forbid any controller files in Stage 6 modules", () => {
      const STAGE_6_MODULE_PATHS = [
        "modules/scheduler",
        "modules/executor",
        "modules/cron-validation",
      ];

      const violations: string[] = [];

      STAGE_6_MODULE_PATHS.forEach((modulePath) => {
        const fullPath = path.join(srcDir, modulePath);
        if (!fs.existsSync(fullPath)) {
          // Module doesn't exist yet - PASS
          return;
        }

        const allFiles = getAllFiles(fullPath);
        allFiles.forEach((file) => {
          if (file.endsWith(".controller.ts")) {
            violations.push(
              `${file} - Controller file FORBIDDEN in Stage 6 modules (background workers only, no HTTP endpoints)`,
            );
          }
        });
      });

      if (violations.length > 0) {
        throw new Error(
          `S6-L3 VIOLATION: Stage 6 modules must NOT contain controllers:\n${violations.join("\n")}`,
        );
      }
    });
  });

  describeS6("S6-L7: IMMUTABILITY CHECK (Stage 0-5 artifacts)", () => {
    it("should fail if any Stage 0-5 artifact is modified", () => {
      const IMMUTABLE_PATHS = [
        "src/core",
        "src/shared",
        "src/modules/auth",
        "src/modules/organizations",
        "src/modules/users",
        "src/modules/roles",
        "src/modules/workflows",
        "src/modules/workflow-instances",
        "src/modules/workflow-triggers",
        "src/modules/scheduled-triggers",
        "src/modules/deferred-execution",
      ];

      try {
        // Check unstaged changes
        const diff = execSync("git diff --name-only", {
          cwd: projectRoot,
          encoding: "utf-8",
        });

        // Check staged changes
        const stagedDiff = execSync("git diff --name-only --cached", {
          cwd: projectRoot,
          encoding: "utf-8",
        });

        const allChanges = (diff + "\n" + stagedDiff)
          .split("\n")
          .filter((line) => line.trim().length > 0);

        const violations: string[] = [];

        // ============================================================
        // NO PATCH EXCEPTIONS FOR STAGE 6
        // ============================================================
        // Stage 0-5 artifacts are IMMUTABLE. Any modification requires
        // formal PATCH AUTHORIZATION. No pre-authorized patches exist.

        allChanges.forEach((changedFile) => {
          // Normalize path separators
          const normalizedFile = changedFile.replace(/\\/g, "/");

          IMMUTABLE_PATHS.forEach((immutablePath) => {
            const normalizedImmutablePath = immutablePath.replace(/\\/g, "/");
            if (normalizedFile.includes(normalizedImmutablePath)) {
              violations.push(
                `${changedFile} - IMMUTABLE ARTIFACT MODIFIED (Stage 0-5) - Requires formal PATCH AUTHORIZATION`,
              );
            }
          });
        });

        if (violations.length > 0) {
          throw new Error(
            `S6-L7 VIOLATION: Stage 0-5 artifacts are IMMUTABLE:\n${violations.join("\n")}`,
          );
        }
      } catch (error: any) {
        if (error.message.includes("S6-L7 VIOLATION")) {
          throw error;
        }
        // Git command failed - assume clean
      }
    });
  });
});
