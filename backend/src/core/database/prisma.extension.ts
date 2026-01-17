import { Prisma } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

/**
 * PrismaTenantExtension - Core Multi-Tenancy Enforcement
 *
 * 🛡️ CRITICAL SECURITY COMPONENT
 *
 * This extension automatically:
 * 1. INJECTS organizationId into WHERE clauses for tenant-scoped models
 * 2. INJECTS organizationId into CREATE data
 * 3. BLOCKS queries without tenant context (FAIL-CLOSED DEFAULT)
 * 4. OVERWRITES any manual organizationId to prevent injection attacks
 * 5. BLOCKS organizationId mutation in update operations
 * 6. LOGS all queries for security audit
 *
 * SECURITY POLICY: FAIL-CLOSED
 * - Only GLOBAL_MODELS can be accessed without tenant context
 * - ALL OTHER MODELS require orgId or throw TENANT_ISOLATION_VIOLATION
 *
 * @security NEVER modify without security review
 */

/**
 * GLOBAL MODELS - EXPLICIT WHITELIST
 *
 * ONLY these models can be accessed without tenant context.
 * These are truly system-wide entities not tied to any organization.
 *
 * @security Adding a model here is a SECURITY DECISION - requires review
 */
const GLOBAL_MODELS = [
  "Organization", // Root entity - organizations themselves
  "SystemConfig", // System-wide configuration (if exists)
];

/**
 * MODELS WITH INDIRECT TENANT ASSOCIATION
 *
 * These models don't have organizationId directly but are scoped via relations.
 * They require special handling - filtered by related entity's tenant.
 *
 * NOTE: Currently these are allowed with orgId context but don't get orgId injected
 * because they have no organizationId column. The relation chain enforces isolation.
 */
const INDIRECTLY_SCOPED_MODELS = [
  "Permission", // Scoped via Role -> Organization (roleId required)
  "UserRole", // Scoped via User -> Organization (userId required)
  "RefreshToken", // Scoped via User -> Organization (userId required)
  "WorkflowState", // Scoped via WorkflowDefinition -> Organization (workflowDefinitionId required)
  "WorkflowTransition", // Scoped via WorkflowDefinition -> Organization (workflowDefinitionId required)
];

/**
 * MODELS WITH DIRECT organizationId FIELD
 *
 * These models have organizationId column and get auto-filtering.
 */
const DIRECTLY_SCOPED_MODELS = [
  "User",
  "Role",
  "Lead",
  "Task",
  "WorkflowDefinition",
  "WorkflowInstance",      // Stage 3 - Runtime
  "WorkflowExecutionLog",  // Stage 3 - Runtime (immutable history)
];

export interface TenantContext {
  orgId: string | null;
  userId: string | null;
}

/**
 * Injectable Prisma Tenant Extension
 *
 * Uses ClsService directly for context retrieval.
 */
@Injectable()
export class PrismaTenantExtension {
  private readonly logger = new Logger(PrismaTenantExtension.name);

  constructor(private readonly clsService: ClsService) {}

  /**
   * Check if model has direct organizationId field
   */
  private hasDirectOrgId(model: string): boolean {
    return DIRECTLY_SCOPED_MODELS.includes(model);
  }

  /**
   * Creates the Prisma extension for tenant isolation
   */
  create() {
    const clsService = this.clsService;
    const logger = this.logger;
    const hasDirectOrgId = this.hasDirectOrgId.bind(this);

    return Prisma.defineExtension({
      name: "tenant-isolation-enforcer",
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            const orgId = clsService.get("orgId");
            const userId = clsService.get("userId");

            // 🔍 AUDIT LOG: Track all database operations
            logger.debug(
              `[QUERY] ${model}.${operation} | OrgId: ${orgId || "NONE"} | UserId: ${userId || "NONE"}`,
            );

            // ══════════════════════════════════════════════════════════════
            // SECURITY POLICY: FAIL-CLOSED DEFAULT
            // ══════════════════════════════════════════════════════════════

            // ✅ GLOBAL MODELS - Explicit whitelist, allowed without orgId
            if (GLOBAL_MODELS.includes(model)) {
              logger.debug(
                `[GLOBAL] ${model} - Allowing without tenant filter`,
              );
              return query(args);
            }

            // 🚨 FAIL-CLOSED: ALL non-global models require tenant context
            if (!orgId) {
              const errorMsg =
                `TENANT_ISOLATION_VIOLATION: No tenant context for ${model}.${operation}. ` +
                `Model is not in GLOBAL_MODELS whitelist.`;
              logger.error(`🚨 ${errorMsg}`);
              throw new Error(errorMsg);
            }

            // Initialize args if needed
            if (!args) {
              args = {} as typeof args;
            }

            // ══════════════════════════════════════════════════════════════
            // TENANT FILTERING - Only for models with direct organizationId
            // ══════════════════════════════════════════════════════════════

            // Skip organizationId injection for indirectly-scoped models
            // (they don't have the column, isolation is via relations)
            if (INDIRECTLY_SCOPED_MODELS.includes(model)) {
              logger.debug(
                `[INDIRECT] ${model} - Has orgId context, skipping direct injection`,
              );
              return query(args);
            }

            // 🛡️ APPLY TENANT FILTERING for directly-scoped models
            if (hasDirectOrgId(model)) {
              // ──────────────────────────────────────────────────────────────
              // CREATE OPERATIONS
              // ──────────────────────────────────────────────────────────────
              if (operation === "create") {
                if (!(args as any).data) {
                  (args as any).data = {};
                }

                // 🚫 OVERWRITE any manual organizationId (security)
                if (
                  (args as any).data.organizationId &&
                  (args as any).data.organizationId !== orgId
                ) {
                  logger.warn(
                    `⚠️ [SECURITY] Blocked organizationId injection in CREATE: ` +
                      `${(args as any).data.organizationId} -> ${orgId}`,
                  );
                }

                (args as any).data.organizationId = orgId;
                logger.debug(`[CREATE] Injected organizationId: ${orgId}`);
              }

              // For createMany - inject into each record
              if (operation === "createMany") {
                if ((args as any).data && Array.isArray((args as any).data)) {
                  (args as any).data = (args as any).data.map((item: any) => ({
                    ...item,
                    organizationId: orgId, // Overwrite any existing
                  }));
                  logger.debug(
                    `[CREATE_MANY] Injected organizationId into ${(args as any).data.length} records`,
                  );
                }
              }

              // ──────────────────────────────────────────────────────────────
              // READ OPERATIONS - Add WHERE filter
              // ──────────────────────────────────────────────────────────────
              if (
                operation.includes("find") ||
                operation === "count" ||
                operation === "aggregate"
              ) {
                if (!(args as any).where) {
                  (args as any).where = {};
                }
                (args as any).where.organizationId = orgId;
                logger.debug(
                  `[FILTER] Added organizationId to WHERE: ${orgId}`,
                );
              }

              // ──────────────────────────────────────────────────────────────
              // UPDATE OPERATIONS - Filter + BLOCK organizationId mutation
              // ──────────────────────────────────────────────────────────────
              if (operation === "update") {
                if (!(args as any).where) {
                  (args as any).where = {};
                }
                (args as any).where.organizationId = orgId;

                // 🚫 CRITICAL: Block organizationId mutation
                if (
                  (args as any).data &&
                  (args as any).data.organizationId !== undefined
                ) {
                  logger.warn(
                    `⚠️ [SECURITY] Blocked organizationId mutation in UPDATE: ` +
                      `Attempted to set ${(args as any).data.organizationId}`,
                  );
                  delete (args as any).data.organizationId;
                }
                logger.debug(`[UPDATE] Filtered by organizationId: ${orgId}`);
              }

              if (operation === "updateMany") {
                if (!(args as any).where) {
                  (args as any).where = {};
                }
                (args as any).where.organizationId = orgId;

                // 🚫 CRITICAL: Block organizationId mutation in bulk updates
                if (
                  (args as any).data &&
                  (args as any).data.organizationId !== undefined
                ) {
                  logger.warn(
                    `⚠️ [SECURITY] Blocked organizationId mutation in UPDATE_MANY: ` +
                      `Attempted to set ${(args as any).data.organizationId}`,
                  );
                  delete (args as any).data.organizationId;
                }
                logger.debug(
                  `[UPDATE_MANY] Filtered by organizationId: ${orgId}`,
                );
              }

              // ──────────────────────────────────────────────────────────────
              // DELETE OPERATIONS
              // ──────────────────────────────────────────────────────────────
              if (operation.includes("delete")) {
                if (!(args as any).where) {
                  (args as any).where = {};
                }
                (args as any).where.organizationId = orgId;
                logger.debug(`[DELETE] Filtered by organizationId: ${orgId}`);
              }

              // ──────────────────────────────────────────────────────────────
              // UPSERT OPERATIONS
              // ──────────────────────────────────────────────────────────────
              if (operation === "upsert") {
                if (!(args as any).where) {
                  (args as any).where = {};
                }
                (args as any).where.organizationId = orgId;

                if ((args as any).create) {
                  (args as any).create.organizationId = orgId;
                }
                if ((args as any).update) {
                  // 🚫 Block organizationId mutation in update part
                  delete (args as any).update.organizationId;
                }
                logger.debug(`[UPSERT] Applied tenant filter and injection`);
              }
            } else {
              // 🚨 FAIL-CLOSED: Unknown/uncategorized models are BLOCKED
              // This prevents security gaps when new models are added without proper categorization
              const errorMsg =
                `TENANT_ISOLATION_VIOLATION: Model '${model}' is not categorized for tenant enforcement. ` +
                `Add to GLOBAL_MODELS, DIRECTLY_SCOPED_MODELS, or INDIRECTLY_SCOPED_MODELS.`;
              logger.error(`🚨 ${errorMsg}`);
              throw new Error(errorMsg);
            }

            // Execute the query with modified args
            const result = await query(args);

            // 🔍 AUDIT: Log result count for monitoring
            if (Array.isArray(result)) {
              logger.debug(
                `[RESULT] ${model}.${operation} returned ${result.length} records`,
              );
            }

            return result;
          },
        },
      },
    });
  }
}
