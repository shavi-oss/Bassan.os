import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateOrganizationDto } from "./dto/create-organization.dto";
import * as bcrypt from "bcrypt";

/**
 * OrganizationsService
 *
 * Handles organization bootstrap and retrieval.
 *
 * SECURITY NOTE: Organization creation uses _unsafeClient because
 * there is no tenant context yet (we're creating the first org).
 * All other operations use the secure client.
 */
@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create organization with admin user and role
   *
   * SECURITY JUSTIFICATION: Uses _unsafeClient because this is org bootstrap.
   * No tenant context exists yet.
   */
  async create(dto: CreateOrganizationDto) {
    // Check if email already exists
    const existingUser = await this.prisma._unsafeClient.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new ForbiddenException("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.adminPassword, 10);

    // Create organization
    const organization = await this.prisma._unsafeClient.organization.create({
      data: {
        name: dto.name,
        slug: dto.name.toLowerCase().replace(/\\s+/g, "-"),
      },
    });

    // Create admin role
    const adminRole = await this.prisma._unsafeClient.role.create({
      data: {
        name: "Admin",
        description: "Organization administrator with full permissions",
        organizationId: organization.id,
      },
    });

    // Create basic permissions for admin
    await this.prisma._unsafeClient.permission.createMany({
      data: [
        { action: "create", resource: "users", roleId: adminRole.id },
        { action: "read", resource: "users", roleId: adminRole.id },
        { action: "create", resource: "roles", roleId: adminRole.id },
        { action: "read", resource: "roles", roleId: adminRole.id },
        { action: "assign", resource: "permissions", roleId: adminRole.id },
      ],
    });

    // Create admin user
    const user = await this.prisma._unsafeClient.user.create({
      data: {
        email: dto.adminEmail,
        passwordHash,
        firstName: dto.adminFirstName,
        lastName: dto.adminLastName,
        organizationId: organization.id,
        roles: {
          create: {
            roleId: adminRole.id,
          },
        },
      },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return {
      organization,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Get organization by ID
   *
   * SECURITY: Enforces that user can only read their own organization
   */
  async findOne(id: string, userOrgId: string) {
    // Explicit org ownership check
    if (id !== userOrgId) {
      throw new ForbiddenException("Cannot access other organizations");
    }

    const organization = await this.prisma.client.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException("Organization not found");
    }

    return organization;
  }

  private sanitizeUser(user: any) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...sanitized } = user;
    return {
      ...sanitized,
      roles: user.roles?.map((ur: any) => ur.role.name) || [],
    };
  }
}
