import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

/**
 * AdminJwtStrategy — S2S (Service-to-Service) JWT validation
 *
 * PR-101: Admin onboarding endpoint guard.
 *
 * SECURITY CONTRACT:
 * - Validates S2S tokens issued by Suite admin service.
 * - Requires claim `type: 's2s'` OR scope containing `bassan:admin`.
 * - Does NOT require or accept organizationId — admin tokens are cross-tenant.
 * - Registered locally in AdminModule; does NOT touch auth.module.ts.
 * - Secret loaded from ADMIN_JWT_SECRET env var (never hardcoded).
 * - Fail-closed: any validation failure throws UnauthorizedException (401).
 */
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "admin-jwt") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("ADMIN_JWT_SECRET"),
    });
  }

  async validate(payload: {
    sub: string;
    type?: string;
    scope?: string;
    iss?: string;
  }) {
    // Fail-closed: require type:'s2s' OR scope containing 'bassan:admin'
    const isS2SType = payload.type === "s2s";
    const hasAdminScope =
      typeof payload.scope === "string" &&
      payload.scope.split(" ").includes("bassan:admin");

    if (!isS2SType && !hasAdminScope) {
      throw new UnauthorizedException(
        "Token does not have required s2s type or bassan:admin scope",
      );
    }

    // Return minimal principal — no organizationId
    return {
      sub: payload.sub,
      type: payload.type,
      scope: payload.scope,
      iss: payload.iss,
    };
  }
}
