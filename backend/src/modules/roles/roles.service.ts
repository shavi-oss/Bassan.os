import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";
import { ClsService } from "nestjs-cls";

/**
 * RolesService
 *
 * SECURITY CRITICAL: Permission queries MUST use relation-based filters.
 * This is enforced by security linter (L2).
 */
@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private cls: ClsService,
  ) {}

  async create(dto: CreateRoleDto) {
    // organizationId auto-injected by Prisma extension
    const role = await this.prisma.client.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return role;
  }

  async findAll() {
    // Auto-filtered by tenant extension
    const roles = await this.prisma.client.role.findMany({
      include: {
        _count: {
          select: { permissions: true },
        },
      },
    });

    return roles;
  }

  async assignPermissions(roleId: string, dto: AssignPermissionsDto) {
    // Verify role belongs to current org
    const role = await this.prisma.client.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    // Create permissions
    await this.prisma.client.permission.createMany({
      data: dto.permissions.map((p) => ({
        action: p.action,
        resource: p.resource,
        roleId,
      })),
      skipDuplicates: true,
    });

    return { message: "Permissions assigned successfully" };
  }

  async getPermissions(roleId: string) {
    const orgId = this.cls.get("orgId");

    /**
     * SECURITY CRITICAL: Relation-based tenant filter
     *
     * Permission model has NO organizationId column.
     * We MUST filter via role.organizationId to enforce tenant isolation.
     *
     * This is enforced by security linter (L2).
     */
    const permissions = await this.prisma.client.permission.findMany({
      where: {
        roleId,
        role: {
          organizationId: orgId,
        },
      },
    });

    return permissions;
  }
}
