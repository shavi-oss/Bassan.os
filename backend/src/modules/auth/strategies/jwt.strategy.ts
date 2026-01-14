import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * JwtStrategy - JWT validation for Passport
 * 
 * @security Uses _unsafeClient because JWT validation happens BEFORE
 * CLS context is established. This is a Passport lifecycle requirement.
 * 
 * The validate() method runs before any guard can set CLS context,
 * so we MUST use the unsafe client to look up the user.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string; organizationId: string }) {
    // Use _unsafeClient because CLS context isn't set yet during JWT validation
    const user = await this.prisma._unsafeClient.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException();
    }

    // Return user info that will be attached to request.user
    // TenantGuard will use this to set CLS context
    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.organizationId,
    };
  }
}
