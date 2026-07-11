import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateOrganizationDto } from "../organizations/dto/create-organization.dto";
import { AdminAuditService } from "./admin-audit.service";

export interface AdminOperationMeta {
  performedBy: string;
  performedByService?: string;
  correlationId: string;
}

/**
 * AdminService — Thin adapter for admin-safe organization bootstrap.
 *
 * PR-101: Wraps OrganizationsService.create() with mandatory audit logging
 * via AdminAuditService (DI-injected, not console.log).
 *
 * SECURITY CONTRACT:
 * - Calls OrganizationsService.create() — does NOT duplicate bootstrap logic.
 * - Mandatory auditService.logAction() on every create attempt (success and failure).
 * - Fail-closed: if audit logging fails, the operation is aborted with 500.
 * - No organizationId accepted from caller — enforced by AdminController.
 * - Logger output does NOT include JWT tokens or secrets.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    private readonly organizationsService: OrganizationsService,
    private readonly auditService: AdminAuditService,
  ) {}

  async createOrganization(
    dto: CreateOrganizationDto,
    meta: AdminOperationMeta,
  ) {
    // MANDATORY AUDIT: Log the attempt before execution (fail-closed)
    try {
      this.auditService.logAction({
        correlationId: meta.correlationId,
        entityType: "organization",
        entityId: null,
        action: "create",
        performedBy: meta.performedBy,
        performedByService: meta.performedByService,
        result: "attempt",
        metadata: { orgName: dto.name },
      });
    } catch (auditError) {
      this.logger.error(
        `[AUDIT FAIL] correlationId=${meta.correlationId} performedBy=${meta.performedBy} error=audit_pre_log_failed`,
      );
      throw new InternalServerErrorException(
        "AUDIT_FAIL: Pre-operation audit log failed; operation aborted",
      );
    }

    let result: Awaited<ReturnType<OrganizationsService["create"]>>;

    try {
      result = await this.organizationsService.create(dto);
    } catch (err) {
      // Audit the failure, then re-throw
      try {
        this.auditService.logAction({
          correlationId: meta.correlationId,
          entityType: "organization",
          entityId: null,
          action: "create",
          performedBy: meta.performedBy,
          performedByService: meta.performedByService,
          result: "failure",
          metadata: {
            orgName: dto.name,
            error: err instanceof Error ? err.message : "unknown",
          },
        });
      } catch {
        // Audit failure on error path — log but don't mask original error
        this.logger.error(
          `[AUDIT FAIL] correlationId=${meta.correlationId} error=audit_failure_log_failed`,
        );
      }
      throw err;
    }

    // MANDATORY AUDIT: Log success
    try {
      this.auditService.logAction({
        correlationId: meta.correlationId,
        entityType: "organization",
        entityId: result.organization.id,
        action: "create",
        performedBy: meta.performedBy,
        performedByService: meta.performedByService,
        result: "success",
        metadata: { orgName: dto.name },
      });
    } catch (auditError) {
      // Fail-closed: if post-success audit fails, abort with 500
      this.logger.error(
        `[AUDIT FAIL] correlationId=${meta.correlationId} performedBy=${meta.performedBy} error=audit_post_log_failed`,
      );
      throw new InternalServerErrorException(
        "AUDIT_FAIL: Post-operation audit log failed; manual review required",
      );
    }

    return result;
  }

  async suspendOrganization(id: string, meta: AdminOperationMeta) {
    return this.setOrgActiveWithAudit(id, false, "suspend", meta);
  }

  async unsuspendOrganization(id: string, meta: AdminOperationMeta) {
    return this.setOrgActiveWithAudit(id, true, "unsuspend", meta);
  }

  async deactivateOrganization(id: string, meta: AdminOperationMeta) {
    return this.setOrgActiveWithAudit(id, false, "deactivate", meta);
  }

  /**
   * Admin-safe organization lookup by ID (S2S verification).
   * Wraps OrganizationsService.findByIdAdmin with mandatory audit logging.
   */
  async getOrganizationById(id: string, meta: AdminOperationMeta) {
    try {
      this.auditService.logAction({
        correlationId: meta.correlationId,
        entityType: "organization",
        entityId: id,
        action: "verify",
        performedBy: meta.performedBy,
        performedByService: meta.performedByService,
        result: "attempt",
        metadata: { id },
      });
    } catch {
      throw new InternalServerErrorException(
        "AUDIT_FAIL: Pre-operation audit log failed for verify; operation aborted",
      );
    }

    let result: any;
    try {
      result = await this.organizationsService.findByIdAdmin(id);
    } catch (err) {
      try {
        this.auditService.logAction({
          correlationId: meta.correlationId,
          entityType: "organization",
          entityId: id,
          action: "verify",
          performedBy: meta.performedBy,
          result: "failure",
          metadata: { error: err instanceof Error ? err.message : "unknown" },
        });
      } catch {
        /* best effort */
      }
      throw err;
    }

    try {
      this.auditService.logAction({
        correlationId: meta.correlationId,
        entityType: "organization",
        entityId: id,
        action: "verify",
        performedBy: meta.performedBy,
        result: "success",
        metadata: { id },
      });
    } catch {
      this.logger.error(
        `[AUDIT FAIL] correlationId=${meta.correlationId} action=verify error=audit_post_log_failed`,
      );
      throw new InternalServerErrorException(
        "AUDIT_FAIL: Post-operation audit log failed for verify; manual review required",
      );
    }

    return result;
  }

  private async setOrgActiveWithAudit(
    id: string,
    isActive: boolean,
    action: string,
    meta: AdminOperationMeta,
  ) {
    try {
      this.auditService.logAction({
        correlationId: meta.correlationId,
        entityType: "organization",
        entityId: id,
        action,
        performedBy: meta.performedBy,
        performedByService: meta.performedByService,
        result: "attempt",
        metadata: { isActive },
      });
    } catch {
      throw new InternalServerErrorException(
        `AUDIT_FAIL: Pre-operation audit log failed for ${action}; operation aborted`,
      );
    }

    let result: any;
    try {
      result = await this.organizationsService.setOrgActive(id, isActive);
    } catch (err) {
      try {
        this.auditService.logAction({
          correlationId: meta.correlationId,
          entityType: "organization",
          entityId: id,
          action,
          performedBy: meta.performedBy,
          result: "failure",
          metadata: { error: err instanceof Error ? err.message : "unknown" },
        });
      } catch {
        /* best effort */
      }
      throw err;
    }

    try {
      this.auditService.logAction({
        correlationId: meta.correlationId,
        entityType: "organization",
        entityId: id,
        action,
        performedBy: meta.performedBy,
        result: "success",
        metadata: { isActive },
      });
    } catch {
      this.logger.error(
        `[AUDIT FAIL] correlationId=${meta.correlationId} action=${action} error=audit_post_log_failed`,
      );
      throw new InternalServerErrorException(
        `AUDIT_FAIL: Post-operation audit log failed for ${action}; manual review required`,
      );
    }

    return result;
  }
}
