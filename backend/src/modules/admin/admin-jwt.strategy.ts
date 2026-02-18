import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy, StrategyOptions } from "passport-jwt";
import { ConfigService } from "@nestjs/config";
import * as https from "https";
import * as http from "http";
import * as crypto from "crypto";

/**
 * AdminJwtStrategy — S2S (Service-to-Service) JWT validation
 *
 * PR-101: Admin onboarding endpoint guard.
 *
 * SECURITY CONTRACT:
 * - Validates S2S tokens issued by Suite admin service.
 * - Key resolution order (JWKS-first, fail-closed):
 *     1. ADMIN_JWKS_URL  → fetch JWKS, match kid, verify RS256 (preferred)
 *     2. ADMIN_JWT_PUBLIC_KEY → use PEM public key, verify RS256
 *     3. ADMIN_JWT_SECRET → use shared secret, verify HS256 (fallback only)
 * - Requires claim: payload.type === 's2s'
 *     OR payload.scope includes 'bassan:admin'
 *     OR payload.aud === 'bassan:admin'
 * - payload.sub MUST be present.
 * - Does NOT require or accept organizationId — admin tokens are cross-tenant.
 * - Registered locally in AdminModule; does NOT touch auth.module.ts.
 * - Fail-closed: any validation failure throws UnauthorizedException (401).
 *
 * ENV REQUIREMENTS (document in PR body):
 *   ADMIN_JWKS_URL         (preferred) — e.g. https://suite.bassan.io/.well-known/jwks.json
 *   ADMIN_JWT_PUBLIC_KEY   (alternative) — RS256 PEM public key
 *   ADMIN_JWT_SECRET       (fallback) — HS256 shared secret
 */
@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, "admin-jwt") {
  private readonly logger = new Logger(AdminJwtStrategy.name);

  constructor(private configService: ConfigService) {
    const jwksUrl = configService.get<string>("ADMIN_JWKS_URL");
    const publicKey = configService.get<string>("ADMIN_JWT_PUBLIC_KEY");
    const secret = configService.get<string>("ADMIN_JWT_SECRET");

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // secretOrKeyProvider is used when JWKS or PUBLIC_KEY is configured.
      // Falls back to secretOrKey (HS256) only when ADMIN_JWT_SECRET is the only option.
      ...(jwksUrl || publicKey
        ? {
            secretOrKeyProvider: AdminJwtStrategy.buildSecretOrKeyProvider(
              jwksUrl,
              publicKey,
            ),
          }
        : {
            secretOrKey: secret,
          }),
    };

    super(options);
  }

  /**
   * Build a secretOrKeyProvider callback for passport-jwt.
   * Supports JWKS (RS256) and static PEM public key (RS256).
   */
  private static buildSecretOrKeyProvider(
    jwksUrl: string | undefined,
    publicKey: string | undefined,
  ) {
    // Simple in-memory JWKS cache (TTL: 5 minutes)
    let jwksCache: { keys: JwkKey[]; fetchedAt: number } | null = null;
    const CACHE_TTL_MS = 5 * 60 * 1000;

    return async (
      _request: unknown,
      rawJwtToken: string,
      done: (err: Error | null, secretOrKey?: string | Buffer) => void,
    ) => {
      try {
        if (jwksUrl) {
          // Decode header to get kid and alg
          const [headerB64] = rawJwtToken.split(".");
          const header = JSON.parse(
            Buffer.from(headerB64, "base64url").toString("utf8"),
          ) as { kid?: string; alg?: string };

          const keys = await AdminJwtStrategy.fetchJwks(
            jwksUrl,
            jwksCache,
            CACHE_TTL_MS,
            (cache) => {
              jwksCache = cache;
            },
          );

          const matchingKey = header.kid
            ? keys.find((k) => k.kid === header.kid)
            : keys[0];

          if (!matchingKey) {
            return done(new Error("No matching JWKS key found for kid"));
          }

          const pem = AdminJwtStrategy.jwkToPem(matchingKey);
          return done(null, pem);
        }

        if (publicKey) {
          return done(null, publicKey);
        }

        return done(new Error("No key configured for AdminJwtStrategy"));
      } catch (err) {
        return done(err instanceof Error ? err : new Error(String(err)));
      }
    };
  }

  /**
   * Fetch JWKS from URL with simple in-memory cache.
   */
  private static async fetchJwks(
    url: string,
    cache: { keys: JwkKey[]; fetchedAt: number } | null,
    ttlMs: number,
    setCache: (c: { keys: JwkKey[]; fetchedAt: number }) => void,
  ): Promise<JwkKey[]> {
    const now = Date.now();
    if (cache && now - cache.fetchedAt < ttlMs) {
      return cache.keys;
    }

    const body = await AdminJwtStrategy.httpGet(url);
    const jwks = JSON.parse(body) as { keys: JwkKey[] };
    setCache({ keys: jwks.keys, fetchedAt: now });
    return jwks.keys;
  }

  /**
   * Simple HTTP/HTTPS GET returning body as string.
   */
  private static httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith("https") ? https : http;
      lib
        .get(url, (res) => {
          let data = "";
          res.on("data", (chunk: Buffer) => {
            data += chunk.toString();
          });
          res.on("end", () => resolve(data));
        })
        .on("error", reject);
    });
  }

  /**
   * Convert a JWK (RSA public key) to PEM format.
   * Supports RSA keys (kty: 'RSA').
   */
  private static jwkToPem(jwk: JwkKey): string {
    if (jwk.kty !== "RSA") {
      throw new Error(`Unsupported JWK key type: ${jwk.kty}`);
    }
    // Use Node's built-in crypto to create public key from JWK
    const key = crypto.createPublicKey({
      key: jwk as unknown as crypto.JsonWebKey,
      format: "jwk",
    });
    return key.export({ type: "spki", format: "pem" }) as string;
  }

  async validate(payload: {
    sub?: string;
    type?: string;
    scope?: string;
    aud?: string | string[];
    iss?: string;
  }) {
    // Fail-closed: sub MUST be present
    if (!payload.sub) {
      throw new UnauthorizedException("Token missing required sub claim");
    }

    // Require type:'s2s' OR scope includes 'bassan:admin' OR aud === 'bassan:admin'
    const isS2SType = payload.type === "s2s";
    const hasAdminScope =
      typeof payload.scope === "string" &&
      payload.scope.split(" ").includes("bassan:admin");
    const hasAdminAud = Array.isArray(payload.aud)
      ? payload.aud.includes("bassan:admin")
      : payload.aud === "bassan:admin";

    if (!isS2SType && !hasAdminScope && !hasAdminAud) {
      throw new UnauthorizedException(
        "Token does not have required s2s type, bassan:admin scope, or bassan:admin audience",
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

interface JwkKey {
  kty: string;
  kid?: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
  [key: string]: unknown;
}
