import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

/**
 * TenantMiddleware - SAFE version
 *
 * SECURITY FIX: This middleware NO LONGER decodes JWT tokens.
 *
 * Previous version decoded JWT without signature verification,
 * which allowed attackers to forge organizationId and access
 * any organization's data.
 *
 * CLS context is now set by TenantGuard, which runs AFTER
 * JwtAuthGuard validates the token signature.
 *
 * This middleware now only passes through. It can be removed
 * entirely, but kept for backward compatibility and potential
 * future public route handling.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // CLS context is now set by TenantGuard after JWT validation
    // This middleware intentionally does NOT decode tokens
    next();
  }
}
