import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { OrganizationsService } from "../organizations/organizations.service";
import { CreateOrganizationDto } from "../organizations/dto/create-organization.dto";

export interface AdminOperationMeta {
  performedBy: string;
  correlationId: string;
}

/**
 * AdminService — Thin adapter for admin-safe organization bootstrap.
 *
 * PR-101: Wraps OrganizationsService.create() with mandatory audit logging.
 *
 * SECURITY CONTRACT:
 * - Calls OrganizationsService.create() — does NOT duplicate bootstrap logic.
 * - Mandatory audit log entry on every create attempt (success and failure).
 * - Fail-closed: if audit logging fails, the operation is aborted with 500.
 * - No organizationId accepted from caller — enforced by AdminController.
 * - Logger output does NOT include JWT tokens or secrets.
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly organizationsService: OrganizationsService) {}

  async createOrganization(
    dto: CreateOrganizationDto,
    meta: AdminOperationMeta,
  ) {
    // MANDATORY AUDIT: Log the attempt before execution (fail-closed)
    try {
      this.auditLog("admin.organization.create.attempt", {
        correlationId: meta.correlationId,
        performedBy: meta.performedBy,
        orgName: dto.name,
      });
    } catch (auditError) {
      // Fail-closed: if audit logging itself throws, abort the operation
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
      this.auditLog("admin.organization.create.failure", {
        correlationId: meta.correlationId,
        performedBy: meta.performedBy,
        orgName: dto.name,
        error: err instanceof Error ? err.message : "unknown",
      });
      throw err;
    }

    // MANDATORY AUDIT: Log success
    try {
      this.auditLog("admin.organization.create.success", {
        correlationId: meta.correlationId,
        performedBy: meta.performedBy,
        orgName: dto.name,
        organizationId: result.organization.id,
      });
    } catch (auditError) {
      // Fail-closed: if post-success audit fails, abort with 500
      // The org was created but we cannot confirm audit trail — abort.
      this.logger.error(
        `[AUDIT FAIL] correlationId=${meta.correlationId} performedBy=${meta.performedBy} error=audit_post_log_failed`,
      );
      throw new InternalServerErrorException(
        "AUDIT_FAIL: Post-operation audit log failed; manual review required",
      );
    }

    return result;
  }

  /**
   * Structured audit log entry.
   * NOTE: Does NOT log JWT tokens, passwords, or secrets.
   * Tokens are never passed to this method.
   */
  private auditLog(event: string, context: Record<string, unknown>): void {
    this.logger.log(
      JSON.stringify({
        audit: true,
        event,
        timestamp: new Date().toISOString(),
        ...context,
      }),
    );
  }
}
