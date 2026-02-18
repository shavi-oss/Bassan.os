import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule } from "@nestjs/config";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { AdminJwtStrategy } from "./admin-jwt.strategy";
import { AdminAuditService } from "./admin-audit.service";
import { OrganizationsService } from "../organizations/organizations.service";
import { PrismaModule } from "../../prisma/prisma.module";

/**
 * AdminModule — Admin-only S2S module for organization onboarding.
 *
 * PR-101: Registers AdminJwtStrategy locally to avoid editing auth.module.ts
 * (which is in the immutable zone per ARCHITECTURAL_LAWS.md LAW I-02).
 *
 * DESIGN DECISIONS:
 * - AdminJwtStrategy registered as a local provider (not in AuthModule).
 * - OrganizationsService provided directly (OrganizationsModule is immutable
 *   and does not export OrganizationsService; we provide it here with PrismaModule).
 * - AdminAuditService registered locally — TODO: replace with project-wide
 *   AuditService when available (see governance/PR-101-admin-onboarding/PR_101_PLAN.md).
 * - PassportModule registered with NO default strategy to avoid conflicts.
 * - ConfigModule imported to allow AdminJwtStrategy to read ADMIN_JWKS_URL /
 *   ADMIN_JWT_PUBLIC_KEY / ADMIN_JWT_SECRET.
 */
@Module({
  imports: [PassportModule, ConfigModule, PrismaModule],
  controllers: [AdminController],
  providers: [
    AdminService,
    AdminAuditService,
    AdminJwtStrategy,
    OrganizationsService,
  ],
})
export class AdminModule {}
