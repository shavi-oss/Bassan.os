import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Headers,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { AdminJwtAuthGuard } from "./admin-jwt.guard";
import { AdminService } from "./admin.service";
import { CreateOrganizationDto } from "../organizations/dto/create-organization.dto";

/**
 * AdminController — Admin-safe organization onboarding endpoint.
 *
 * PR-101: POST /api/v2/admin/organizations
 *
 * SECURITY CONTRACT:
 * - Protected by AdminJwtAuthGuard (S2S JWT only — no TenantGuard).
 * - organizationId MUST NOT be accepted from client input (LAW SEC-02).
 * - X-Correlation-Id extracted from header for audit traceability.
 * - performedBy extracted from validated S2S token (req.user.sub).
 * - Fail-closed: any error propagates as HTTP error; no silent failures.
 *
 * IMMUTABILITY NOTE: This controller does NOT modify any immutable zone.
 * It reuses CreateOrganizationDto from organizations module (read-only import).
 */
@Controller("api/v2/admin/organizations")
@UseGuards(AdminJwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * POST /api/v2/admin/organizations
   *
   * Creates a new organization via admin S2S token.
   * Reuses OrganizationsService.create() for bootstrap logic.
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrganization(
    @Body() dto: CreateOrganizationDto,
    @Request() req: { user: { sub: string } },
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    // SECURITY: Explicitly reject organizationId from client input (LAW SEC-02)
    // CreateOrganizationDto does not contain organizationId by design,
    // but we add a runtime guard for defence-in-depth.
    if (
      (dto as unknown as Record<string, unknown>)["organizationId"] !==
      undefined
    ) {
      throw new BadRequestException(
        "FORBIDDEN_ORGID_ACCEPTED: organizationId must not be provided by client",
      );
    }

    const performedBy = req.user.sub;
    const resolvedCorrelationId =
      correlationId ??
      `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return this.adminService.createOrganization(dto, {
      performedBy,
      correlationId: resolvedCorrelationId,
    });
  }
}
