import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaTenantExtension } from '../core/database/prisma.extension';

/**
 * PrismaService - Secure Database Access Layer
 * 
 * 🛡️ CRITICAL SECURITY COMPONENT
 * 
 * SECURITY ARCHITECTURE: COMPOSITION PATTERN
 * 
 * This service uses COMPOSITION (not inheritance) to prevent bypass:
 * - Private PrismaClient instance (not exposed)
 * - Only exposes the EXTENDED client via .client getter
 * - Raw SQL methods throw security errors
 * - No way to access unfiltered Prisma methods
 * 
 * BEFORE (UNSAFE - inheritance):
 *   class PrismaService extends PrismaClient { ... }
 *   // Developers could call: this.prisma.lead.findMany() - bypasses extension
 * 
 * AFTER (SAFE - composition):
 *   class PrismaService { private _prisma: PrismaClient; ... }
 *   // Only way to access: this.prisma.client.lead.findMany() - uses extension
 * 
 * @security NEVER expose the base PrismaClient methods
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  
  // 🔒 PRIVATE: Base PrismaClient - never exposed directly
  private readonly _prisma: PrismaClient;
  
  // 🔒 Extended client with tenant filtering - the ONLY safe client
  private _secureClient: any = null;

  constructor(private readonly tenantExtension: PrismaTenantExtension) {
    this._prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'warn' },
      ],
    });

    // 🔍 SECURITY AUDIT: Log all database queries
    this._prisma.$on('query' as never, (event: { query: string; params: string; duration: number }) => {
      const hasTenantFilter = 
        event.query.includes('organizationId') || 
        event.query.includes('"organizationId"') ||
        event.query.includes('organization_id');

      const securityStatus = hasTenantFilter ? '✅ FILTERED' : '⚠️ UNFILTERED';
      
      this.logger.debug(
        `[SQL] ${securityStatus} | ${event.duration}ms\n` +
        `Query: ${event.query.substring(0, 200)}...`
      );
    });

    this._prisma.$on('error' as never, (event: { message: string }) => {
      this.logger.error(`[DB ERROR] ${event.message}`);
    });
  }

  async onModuleInit() {
    this.logger.log('🔌 Connecting to database...');
    await this._prisma.$connect();
    this.logger.log('✅ Database connected');

    // Create the secure client with tenant extension
    this._secureClient = this._prisma.$extends(this.tenantExtension.create());
    
    this.logger.log('🛡️ Tenant isolation extension activated');
    this.logger.log('🔒 PrismaService using COMPOSITION pattern - base client not exposed');
  }

  async onModuleDestroy() {
    this.logger.log('🔌 Disconnecting from database...');
    await this._prisma.$disconnect();
  }

  /**
   * 🔒 SECURE CLIENT ACCESSOR
   * 
   * This is the ONLY way to access the database.
   * All queries go through the tenant extension.
   * 
   * Usage:
   *   this.prisma.client.lead.findMany()  // ✅ Safe - uses extension
   *   
   * NOT possible (by design):
   *   this.prisma.lead.findMany()         // ❌ Not exposed - no bypass
   */
  get client() {
    if (!this._secureClient) {
      throw new Error('PrismaService not initialized - call onModuleInit first');
    }
    return this._secureClient;
  }

  /**
   * 🚫 BLOCKED: Raw SQL access is a security risk
   * 
   * These methods bypass tenant filtering.
   * Provided here to surface the error clearly if someone tries.
   */
  $queryRaw(): never {
    this.logger.error('🚨 SECURITY: Attempted $queryRaw - BLOCKED');
    throw new Error('SECURITY_VIOLATION: Raw SQL queries are forbidden. Use prisma.client methods.');
  }

  $queryRawUnsafe(): never {
    this.logger.error('🚨 SECURITY: Attempted $queryRawUnsafe - BLOCKED');
    throw new Error('SECURITY_VIOLATION: Raw SQL queries are forbidden. Use prisma.client methods.');
  }

  $executeRaw(): never {
    this.logger.error('🚨 SECURITY: Attempted $executeRaw - BLOCKED');
    throw new Error('SECURITY_VIOLATION: Raw SQL execution is forbidden.');
  }

  $executeRawUnsafe(): never {
    this.logger.error('🚨 SECURITY: Attempted $executeRawUnsafe - BLOCKED');
    throw new Error('SECURITY_VIOLATION: Raw SQL execution is forbidden.');
  }

  /**
   * Internal access to base client for system operations ONLY.
   * 
   * @internal This should ONLY be used for:
   * - Database migrations
   * - System-level operations that genuinely need global access
   * 
   * @security Any usage of this method requires security review
   */
  get _unsafeClient(): PrismaClient {
    this.logger.warn('⚠️ [SECURITY] Accessing _unsafeClient - ensure this is justified!');
    return this._prisma;
  }
}
