import { Injectable, ConflictException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";

/**
 * UsersService
 *
 * SECURITY: All operations use prisma.client (tenant-scoped).
 * organizationId comes from CLS context set by TenantGuard.
 */
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Check if email already exists
    const existingUser = await this.prisma.client.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user (organizationId auto-injected by Prisma extension)
    const user = await this.prisma.client.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        ...(dto.roleId && {
          roles: {
            create: {
              roleId: dto.roleId,
            },
          },
        }),
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return this.sanitizeUser(user);
  }

  async findAll() {
    // Auto-filtered by tenant extension
    const users = await this.prisma.client.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return users.map((user) => this.sanitizeUser(user));
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
