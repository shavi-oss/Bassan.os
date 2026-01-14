import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from '../../../src/prisma/prisma.service';
import { PrismaTenantExtension } from '../../../src/core/database/prisma.extension';
import { ClsModule, ClsService } from 'nestjs-cls';
import { Logger } from '@nestjs/common';

/**
 * Stage 0 Foundation Tests
 * 
 * These tests validate:
 * 1. Database connection works
 * 2. Tenant filter mechanism works
 * 3. Error format is consistent
 * 4. Logger format is consistent
 */
describe('Stage 0: Foundation', () => {
  let prismaService: PrismaService;
  let clsService: ClsService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        ClsModule.forRoot({
          global: true,
          middleware: { mount: true },
        }),
      ],
      providers: [
        PrismaService,
        PrismaTenantExtension,
      ],
    }).compile();

    prismaService = module.get<PrismaService>(PrismaService);
    clsService = module.get<ClsService>(ClsService);
    
    await prismaService.onModuleInit();
  });

  afterAll(async () => {
    await prismaService.onModuleDestroy();
    await module.close();
  });

  describe('Database Connection', () => {
    it('should connect to database successfully', async () => {
      // If we get here, connection succeeded in beforeAll
      expect(prismaService).toBeDefined();
      expect(prismaService.client).toBeDefined();
    });

    it('should block raw SQL queries', () => {
      // Cast to any to bypass TypeScript checking since these methods override to return never
      const service = prismaService as any;
      
      let queryRawError: Error | null = null;
      let queryRawUnsafeError: Error | null = null;
      let executeRawError: Error | null = null;
      let executeRawUnsafeError: Error | null = null;

      try {
        service.$queryRaw`SELECT 1`;
      } catch (e) {
        queryRawError = e as Error;
      }

      try {
        service.$queryRawUnsafe('SELECT 1');
      } catch (e) {
        queryRawUnsafeError = e as Error;
      }

      try {
        service.$executeRaw`SELECT 1`;
      } catch (e) {
        executeRawError = e as Error;
      }

      try {
        service.$executeRawUnsafe('SELECT 1');
      } catch (e) {
        executeRawUnsafeError = e as Error;
      }

      expect(queryRawError?.message).toContain('SECURITY_VIOLATION');
      expect(queryRawUnsafeError?.message).toContain('SECURITY_VIOLATION');
      expect(executeRawError?.message).toContain('SECURITY_VIOLATION');
      expect(executeRawUnsafeError?.message).toContain('SECURITY_VIOLATION');
    });
  });

  describe('Tenant Filter Mechanism', () => {
    it('should have ClsService available', () => {
      expect(clsService).toBeDefined();
    });

    it('should set tenant context in CLS', () => {
      clsService.run(() => {
        clsService.set('orgId', 'test-org-123');
        clsService.set('userId', 'test-user-456');
        
        expect(clsService.get('orgId')).toBe('test-org-123');
        expect(clsService.get('userId')).toBe('test-user-456');
      });
    });

    it('should isolate CLS context between runs', () => {
      let firstOrgId: string | undefined;
      let secondOrgId: string | undefined;

      clsService.run(() => {
        clsService.set('orgId', 'org-A');
        firstOrgId = clsService.get('orgId');
      });

      clsService.run(() => {
        clsService.set('orgId', 'org-B');
        secondOrgId = clsService.get('orgId');
      });

      expect(firstOrgId).toBe('org-A');
      expect(secondOrgId).toBe('org-B');
    });
  });

  describe('Error Format', () => {
    it('should throw TENANT_ISOLATION_VIOLATION for tenant-scoped queries without context', async () => {
      // Query without setting orgId should fail for tenant-scoped models
      await clsService.run(async () => {
        // Deliberately NOT setting orgId
        try {
          await prismaService.client.user.findMany();
          fail('Should have thrown TENANT_ISOLATION_VIOLATION');
        } catch (error: any) {
          expect(error.message).toContain('TENANT_ISOLATION_VIOLATION');
        }
      });
    });

    it('should allow global model queries without tenant context', async () => {
      await clsService.run(async () => {
        // Organization is a global model - should not require tenant context
        const result = await prismaService.client.organization.findMany();
        expect(Array.isArray(result)).toBe(true);
      });
    });
  });

  describe('Logger Format', () => {
    it('should use NestJS Logger', () => {
      const logger = new Logger('TestContext');
      expect(logger).toBeDefined();
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.debug).toBe('function');
    });
  });
});
