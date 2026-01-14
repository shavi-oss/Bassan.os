import { Test, TestingModule } from "@nestjs/testing";
import { ClsService, ClsModule } from "nestjs-cls";
import { PrismaClient } from "@prisma/client";
import { PrismaTenantExtension } from "../../../src/core/database/prisma.extension";
import { resetDb, closeDb } from "../../utils/db";

/**
 * 🛡️ PrismaTenantExtension Integration Tests
 *
 * These tests verify the extension's behavior with a REAL Prisma client.
 * Required: PostgreSQL running with migrations applied.
 */
describe("PrismaTenantExtension Integration", () => {
  let prisma: PrismaClient;
  let extendedPrisma: any;
  let clsService: ClsService;
  let extension: PrismaTenantExtension;
  let org1Id: string;
  let org2Id: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ClsModule.forRoot()],
      providers: [PrismaTenantExtension],
    }).compile();

    extension = module.get<PrismaTenantExtension>(PrismaTenantExtension);
    clsService = module.get<ClsService>(ClsService);

    // Create base Prisma client
    prisma = new PrismaClient();
    await prisma.$connect();

    // Create extended client
    extendedPrisma = prisma.$extends(extension.create());
  });

  beforeEach(async () => {
    await resetDb();

    // Create test organizations
    const org1 = await prisma.organization.create({
      data: { name: "Test Org 1", slug: "test-org-1" },
    });
    org1Id = org1.id;

    const org2 = await prisma.organization.create({
      data: { name: "Test Org 2", slug: "test-org-2" },
    });
    org2Id = org2.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await closeDb();
  });

  describe("Global Models", () => {
    it("should allow Organization access without tenant context", async () => {
      // Organization is a GLOBAL model - should work without CLS context
      const orgs = await extendedPrisma.organization.findMany();
      expect(orgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Tenant-Scoped Models", () => {
    it("should THROW when accessing User without tenant context", async () => {
      // User is tenant-scoped, should throw without CLS context
      await expect(extendedPrisma.user.findMany()).rejects.toThrow(
        "TENANT_ISOLATION_VIOLATION",
      );
    });

    it("should THROW when accessing Lead without tenant context", async () => {
      await expect(extendedPrisma.lead.findMany()).rejects.toThrow(
        "TENANT_ISOLATION_VIOLATION",
      );
    });

    it("should allow Lead access WITH tenant context", async () => {
      await clsService.run(async () => {
        clsService.set("orgId", org1Id);
        clsService.set("userId", "test-user-id");

        // Should NOT throw with context
        const leads = await extendedPrisma.lead.findMany();
        expect(Array.isArray(leads)).toBe(true);
      });
    });

    it("should auto-inject organizationId on Lead create", async () => {
      await clsService.run(async () => {
        clsService.set("orgId", org1Id);
        clsService.set("userId", "test-user-id");

        const lead = await extendedPrisma.lead.create({
          data: {
            firstName: "Test",
            lastName: "Lead",
            email: "test-lead@example.com",
          },
        });

        expect(lead.organizationId).toBe(org1Id);
      });
    });

    it("should filter leads by tenant context", async () => {
      // Create lead in org2
      await clsService.run(async () => {
        clsService.set("orgId", org2Id);
        clsService.set("userId", "test-user-id");

        await extendedPrisma.lead.create({
          data: {
            firstName: "Org2",
            lastName: "Lead",
            email: "org2-lead@example.com",
          },
        });
      });

      // Query leads from org1 - should NOT see org2's leads
      await clsService.run(async () => {
        clsService.set("orgId", org1Id);
        clsService.set("userId", "test-user-id");

        const leads = await extendedPrisma.lead.findMany();

        // All leads should belong to org1
        for (const lead of leads) {
          expect(lead.organizationId).toBe(org1Id);
        }
      });
    });

    it("should OVERWRITE malicious organizationId injection", async () => {
      await clsService.run(async () => {
        clsService.set("orgId", org1Id);
        clsService.set("userId", "test-user-id");

        // Try to inject org2Id - should be overwritten
        const lead = await extendedPrisma.lead.create({
          data: {
            firstName: "Injected",
            lastName: "Lead",
            email: "injected@example.com",
            organizationId: org2Id, // ⚠️ MALICIOUS INJECTION
          },
        });

        // Should be org1Id, NOT org2Id
        expect(lead.organizationId).toBe(org1Id);
      });
    });
  });
});
