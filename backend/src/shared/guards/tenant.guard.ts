import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { Request } from 'express';

/**
 * TenantGuard - Sets CLS context and sanitizes requests
 * 
 * 🛡️ CRITICAL SECURITY COMPONENT
 * 
 * This guard:
 * 1. Validates that req.user has organizationId (from JwtAuthGuard)
 * 2. Sets CLS context for Prisma tenant extension
 * 3. SANITIZES request to remove any manual organizationId injection attempts
 * 
 * MUST run AFTER JwtAuthGuard:
 *   @UseGuards(JwtAuthGuard, TenantGuard)
 * 
 * @security NEVER modify without security review
 */
@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(private readonly cls: ClsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as { id: string; email: string; organizationId: string } | undefined;

    // 🚨 CRITICAL: Must have validated JWT with organizationId
    if (!user) {
      this.logger.error('🚨 SECURITY: No user in request - JwtAuthGuard did not run');
      throw new UnauthorizedException('Authentication required');
    }

    if (!user.organizationId) {
      this.logger.error(`🚨 SECURITY: No organizationId in JWT for user ${user.id}`);
      throw new UnauthorizedException('Invalid token - no organization context');
    }

    // ✅ Set CLS context from VALIDATED user object
    this.cls.set('orgId', user.organizationId);
    this.cls.set('userId', user.id);

    // 🛡️ SANITIZE REQUEST: Remove any manual organizationId injection attempts
    this.sanitizeRequest(request);

    this.logger.debug(
      `✅ Tenant context set | Org: ${user.organizationId} | User: ${user.id}`
    );

    return true;
  }

  /**
   * Remove any manual organizationId from request to prevent injection attacks
   */
  private sanitizeRequest(req: Request): void {
    // Sanitize query parameters
    if (req.query) {
      if (req.query.organizationId) {
        this.logger.warn(`⚠️ BLOCKED: Manual organizationId in query: ${req.query.organizationId}`);
        delete req.query.organizationId;
      }
      if (req.query.orgId) {
        this.logger.warn(`⚠️ BLOCKED: Manual orgId in query: ${req.query.orgId}`);
        delete req.query.orgId;
      }
      if (req.query.tenantId) {
        this.logger.warn(`⚠️ BLOCKED: Manual tenantId in query: ${req.query.tenantId}`);
        delete req.query.tenantId;
      }
    }

    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      if (req.body.organizationId) {
        this.logger.warn(`⚠️ BLOCKED: Manual organizationId in body: ${req.body.organizationId}`);
        delete req.body.organizationId;
      }
      if (req.body.orgId) {
        this.logger.warn(`⚠️ BLOCKED: Manual orgId in body: ${req.body.orgId}`);
        delete req.body.orgId;
      }
      if (req.body.tenantId) {
        this.logger.warn(`⚠️ BLOCKED: Manual tenantId in body: ${req.body.tenantId}`);
        delete req.body.tenantId;
      }
    }

    // Sanitize URL parameters
    if (req.params) {
      if (req.params.organizationId) {
        this.logger.warn(`⚠️ BLOCKED: Manual organizationId in params: ${req.params.organizationId}`);
        delete req.params.organizationId;
      }
    }
  }
}

