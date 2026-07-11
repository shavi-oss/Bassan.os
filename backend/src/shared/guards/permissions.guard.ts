import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { PrismaService } from "../../prisma/prisma.service";
import { REQUIRE_PERMISSION_KEY } from "../decorators/require-permission.decorator";

/**
 * PermissionsGuard — enforces tenant RBAC.
 *
 * - If a route has NO @RequirePermission metadata → request is allowed
 *   (only decorated routes are enforced). This keeps existing open routes
 *   working while we roll out fine-grained enforcement.
 * - Users with the "Admin" role are treated as superusers (bypass).
 * - Other users are checked against their Role's Permissions
 *   (resource:action, e.g. "leads:read").
 *
 * Depends on a VALIDATED JWT (JwtAuthGuard) + TenantGuard having run,
 * so request.user is the signed payload.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{
      resource: string;
      action: string;
    }>(REQUIRE_PERMISSION_KEY, [context.getHandler(), context.getClass()]);

    // No @RequirePermission → not enforced on this route
    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const user = (request as any).user as
      | { id?: string; organizationId?: string }
      | undefined;

    if (!user?.id) {
      throw new ForbiddenException("Authentication required");
    }

    // Resolve roles + permissions (tenant-scoped Prisma client)
    const record = await this.prisma.client.user.findUnique({
      where: { id: user.id },
      include: {
        roles: {
          include: {
            role: { include: { permissions: true } },
          },
        },
      },
    });

    if (!record) {
      throw new ForbiddenException("Forbidden");
    }

    // Superuser shortcut
    if (record.roles.some((ur) => ur.role.name === "Admin")) {
      return true;
    }

    const granted = new Set<string>();
    for (const ur of record.roles) {
      for (const p of ur.role.permissions) {
        granted.add(`${p.resource}:${p.action}`);
        granted.add(p.action); // tolerate "leads:read"-style action values
      }
    }

    const need = `${required.resource}:${required.action}`;
    if (granted.has(need) || granted.has(required.action)) {
      return true;
    }

    this.logger.warn(`🚨 Forbidden: user ${user.id} lacks ${need}`);
    throw new ForbiddenException(`Forbidden: requires ${need}`);
  }
}
