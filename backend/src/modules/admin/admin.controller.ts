import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
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

  /**
   * GET /api/v2/admin/organizations/:id
   *
   * Admin-safe organization verification via S2S token.
   * Returns the organization record (no tenant ownership check).
   */
  @Get(":id")
  @HttpCode(HttpStatus.OK)
  async getOrganization(
    @Param("id") id: string,
    @Request() req: { user: { sub: string } },
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    const performedBy = req.user.sub;
    const resolvedCorrelationId =
      correlationId ??
      `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return this.adminService.getOrganizationById(id, {
      performedBy,
      correlationId: resolvedCorrelationId,
    });
  }

  /**
   * PATCH /api/v2/admin/organizations/:id/suspend
   * Suspends (deactivates) an organization via admin S2S token.
   */
  @Patch(":id/suspend")
  @HttpCode(HttpStatus.OK)
  async suspendOrganization(
    @Param("id") id: string,
    @Request() req: { user: { sub: string } },
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    const performedBy = req.user.sub;
    const resolvedCorrelationId =
      correlationId ??
      `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return this.adminService.suspendOrganization(id, {
      performedBy,
      correlationId: resolvedCorrelationId,
    });
  }

  /**
   * PATCH /api/v2/admin/organizations/:id/unsuspend
   * Re-activates a suspended organization via admin S2S token.
   */
  @Patch(":id/unsuspend")
  @HttpCode(HttpStatus.OK)
  async unsuspendOrganization(
    @Param("id") id: string,
    @Request() req: { user: { sub: string } },
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    const performedBy = req.user.sub;
    const resolvedCorrelationId =
      correlationId ??
      `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return this.adminService.unsuspendOrganization(id, {
      performedBy,
      correlationId: resolvedCorrelationId,
    });
  }

  /**
   * PATCH /api/v2/admin/organizations/:id/deactivate
   * Permanently deactivates an organization via admin S2S token.
   */
  @Patch(":id/deactivate")
  @HttpCode(HttpStatus.OK)
  async deactivateOrganization(
    @Param("id") id: string,
    @Request() req: { user: { sub: string } },
    @Headers("x-correlation-id") correlationId?: string,
  ) {
    const performedBy = req.user.sub;
    const resolvedCorrelationId =
      correlationId ??
      `admin-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return this.adminService.deactivateOrganization(id, {
      performedBy,
      correlationId: resolvedCorrelationId,
    });
  }
}
