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
  const ALLOWED_MODULES = [
    "auth",
    "organizations",
    "users",
    "roles",
    "workflows",
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
  ];

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

  describe("S2-L3: Endpoint allowlist enforcement", () => {
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

  describe("S2-L2: Module allowlist enforcement", () => {
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
});
