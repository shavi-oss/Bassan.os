import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

/**
 * AuthService - Authentication business logic
 * 
 * @security This service uses _unsafeClient for authentication operations.
 * 
 * JUSTIFICATION: During login/register, there is NO authenticated user yet,
 * so CLS context cannot be established. Authentication is inherently a
 * "system-level" operation that must access users across all organizations:
 * 
 * - Register: Creates new Organization, User, Role (no prior context)
 * - Login: Must find user by email globally to validate credentials
 * - RefreshToken: Validates tokens before user context is established
 * 
 * This is an EXCEPTIONAL case. All other services MUST use prisma.client.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Get the unsafe client for auth operations
   * @security This is justified for authentication - see class comment
   */
  private get db() {
    return this.prisma._unsafeClient;
  }

  async register(dto: RegisterDto) {
    // Check if email already exists
    const existingUser = await this.db.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create organization
    const organization = await this.db.organization.create({
      data: {
        name: dto.organizationName,
        slug: dto.organizationName.toLowerCase().replace(/\s+/g, '-'),
      },
    });

    // Create admin role for organization
    const adminRole = await this.db.role.create({
      data: {
        name: 'Admin',
        description: 'Organization administrator',
        organizationId: organization.id,
      },
    });

    // Create user role for organization
    await this.db.role.create({
      data: {
        name: 'User',
        description: 'Standard user',
        organizationId: organization.id,
      },
    });

    // Create user
    const user = await this.db.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
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

    this.logger.log(`✅ User registered: ${user.email} in org: ${organization.name}`);

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email, organization.id);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({
      where: { email: dto.email },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`✅ User logged in: ${user.email}`);

    const tokens = await this.generateTokens(user.id, user.email, user.organizationId);

    return {
      user: this.sanitizeUser(user),
      ...tokens,
    };
  }

  async refresh(refreshToken: string) {
    const token = await this.db.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!token || token.revokedAt || token.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    await this.db.refreshToken.update({
      where: { id: token.id },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    return this.generateTokens(token.user.id, token.user.email, token.user.organizationId);
  }

  async logout(userId: string) {
    // Revoke all refresh tokens for user
    await this.db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return { message: 'Logged out successfully' };
  }

  async getProfile(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      include: {
        organization: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  private async generateTokens(userId: string, email: string, organizationId: string) {
    const payload = { sub: userId, email, organizationId };

    const accessToken = this.jwtService.sign(payload);
    
    const refreshToken = uuidv4();
    const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.db.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN', '15m'),
    };
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return {
      ...sanitized,
      roles: user.roles?.map((ur: any) => ur.role.name) || [],
    };
  }
}
