import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import { ClsService } from "nestjs-cls";

import { AppModule } from "../../src/app.module";
import { PrismaService } from "../../src/prisma/prisma.service";
import { SchedulerService } from "../../src/modules/scheduler/scheduler.service";
import { ExecutorService } from "../../src/modules/executor/executor.service";

describe("Stage 6 Background Workers (Integration)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let clsService: ClsService;
  let scheduler: SchedulerService;
  let executor: ExecutorService;

  let tenantA: { id: string };
  let tenantB: { id: string };
  let workflowDefId: string;

  const runAsTenant = async <T>({
    orgId,
    fn,
  }: {
    orgId: string;
    fn: () => Promise<T>;
  }): Promise<T> => {
    return clsService.runWith({ orgId } as any, async () => fn());
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
    clsService = app.get(ClsService);
    scheduler = app.get(SchedulerService);
    executor = app.get(ExecutorService);

    // Cleanup (best-effort) — order matters بسبب FK
    try {
      await prisma.client.workflowInstance.deleteMany();
      await prisma.client.deferredExecution.deleteMany();
      await prisma.client.scheduledTrigger.deleteMany();
      await prisma.client.workflowState.deleteMany();
      await prisma.client.workflowDefinition.deleteMany();
      await prisma.client.organization.deleteMany();
    } catch (e) {
      // non-fatal in case DB is already clean
      // eslint-disable-next-line no-console
      console.warn("Pre-cleanup warning:", e);
    }

    // Seed Tenants
    const slugA = `tenant-a-${Date.now()}`;
    tenantA = await prisma.client.organization.create({
      data: { name: `Tenant A - ${Date.now()}`, slug: slugA },
      select: { id: true },
    });

    const slugB = `tenant-b-${Date.now()}`;
    tenantB = await prisma.client.organization.create({
      data: { name: `Tenant B - ${Date.now()}`, slug: slugB },
      select: { id: true },
    });

    // Seed workflow definition + states تحت CLS context (Tenant A)
    await runAsTenant({
      orgId: tenantA.id,
      fn: async () => {
        const wf = await prisma.client.workflowDefinition.create({
          data: {
            name: `WF Stage6 - ${Date.now()}`,
            organizationId: tenantA.id,
            status: "ACTIVE",
          },
          select: { id: true },
        });

        workflowDefId = wf.id;

        await prisma.client.workflowState.create({
          data: {
            workflowDefinitionId: workflowDefId,
            name: "Start",
            isStart: true,
          },
          select: { id: true },
        });

        await prisma.client.workflowState.create({
          data: {
            workflowDefinitionId: workflowDefId,
            name: "End",
            isEnd: true,
          },
          select: { id: true },
        });
      },
    });
  }, 30_000);

  afterAll(async () => {
    try {
      await prisma.client.workflowInstance.deleteMany();
      await prisma.client.deferredExecution.deleteMany();
      await prisma.client.scheduledTrigger.deleteMany();
      await prisma.client.workflowState.deleteMany();
      await prisma.client.workflowDefinition.deleteMany();
      await prisma.client.organization.deleteMany();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Cleanup failed (non-critical):", e);
    }

    if (app) {
      await app.close();
    }
  }, 30_000);

  describe("1. Scheduler Evaluation", () => {
    it("should evaluate due ScheduledTrigger and create DeferredExecution", async () => {
      const beforeCount = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.count({
            where: { organizationId: tenantA.id },
          }),
      });

      const trigger = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.scheduledTrigger.create({
            data: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
              cronExpression: "* * * * *",
              timezone: "UTC",
              nextExecutionAt: new Date(Date.now() - 60_000),
              isActive: true,
            },
            select: { id: true },
          }),
      });

      await scheduler.processDueTriggers();

      const afterCount = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.count({
            where: { organizationId: tenantA.id },
          }),
      });

      expect(afterCount).toBeGreaterThan(beforeCount);

      const deferred = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.findFirst({
            where: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
            },
            orderBy: { createdAt: "desc" },
          }),
      });

      expect(deferred).not.toBeNull();
      expect(deferred!.organizationId).toBe(tenantA.id);
      expect(deferred!.workflowDefinitionId).toBe(workflowDefId);

      if (deferred!.scheduledTriggerId) {
        expect(deferred!.scheduledTriggerId).toBe(trigger.id);
      }
    });
  });

  describe("2. Executor Processing", () => {
    it("should process DeferredExecution and create WorkflowInstance", async () => {
      const execution = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.create({
            data: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
              idempotencyKey: `test-exec-${Date.now()}`,
              scheduledFor: new Date(Date.now() - 1_000),
              status: "PENDING",
              retryCount: 0,
              maxRetries: 2,
            },
            select: { id: true },
          }),
      });

      await executor.processDueExecutions();

      const created = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.workflowInstance.findFirst({
            where: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
            },
          }),
      });

      expect(created).not.toBeNull();
      expect(created!.organizationId).toBe(tenantA.id);
      expect(created!.workflowDefinitionId).toBe(workflowDefId);

      const updatedExecution = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.findUnique({
            where: { id: execution.id },
          }),
      });

      expect(updatedExecution).not.toBeNull();
      expect(updatedExecution!.status).toBe("COMPLETED");
    });
  });

  describe("3. Tenant Isolation", () => {
    it("should NOT create cross-tenant DeferredExecution ownership (Security Check)", async () => {
      const beforeCountA = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.count({
            where: { organizationId: tenantA.id },
          }),
      });

      const beforeCountB = await runAsTenant({
        orgId: tenantB.id,
        fn: async () =>
          prisma.client.deferredExecution.count({
            where: { organizationId: tenantB.id },
          }),
      });

      await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.scheduledTrigger.create({
            data: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
              cronExpression: "* * * * *",
              timezone: "UTC",
              nextExecutionAt: new Date(Date.now() - 60_000),
              isActive: true,
            },
          }),
      });

      // Run scheduler in Tenant B context to verify it doesn't affect ownership
      await clsService.runWith({ orgId: tenantB.id } as any, async () => {
        await scheduler.processDueTriggers();
      });

      const afterCountA = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.count({
            where: { organizationId: tenantA.id },
          }),
      });

      const afterCountB = await runAsTenant({
        orgId: tenantB.id,
        fn: async () =>
          prisma.client.deferredExecution.count({
            where: { organizationId: tenantB.id },
          }),
      });

      expect(afterCountA).toBeGreaterThan(beforeCountA);
      expect(afterCountB).toBe(beforeCountB);

      const createdExecution = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.findFirst({
            where: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
            },
            orderBy: { createdAt: "desc" },
          }),
      });

      expect(createdExecution).not.toBeNull();
      expect(createdExecution!.organizationId).toBe(tenantA.id);
      expect(createdExecution!.organizationId).not.toBe(tenantB.id);
      expect(createdExecution!.workflowDefinitionId).toBe(workflowDefId);
    });
  });

  describe("4. Idempotency & Retry", () => {
    it("should not re-process completed executions", async () => {
      const key = `test-idem-${Date.now()}`;

      const execution = await runAsTenant({
        orgId: tenantA.id,
        fn: async () => {
          return prisma.client.deferredExecution.create({
            data: {
              organizationId: tenantA.id,
              workflowDefinitionId: workflowDefId,
              idempotencyKey: key,
              scheduledFor: new Date(Date.now() - 1_000),
              status: "COMPLETED",
              retryCount: 1,
              maxRetries: 2,
            },
            select: { id: true },
          });
        },
      });

      await executor.processDueExecutions();

      const updated = await runAsTenant({
        orgId: tenantA.id,
        fn: async () =>
          prisma.client.deferredExecution.findUnique({
            where: { id: execution.id },
          }),
      });

      expect(updated).not.toBeNull();
      expect(updated!.status).toBe("COMPLETED");
      expect(updated!.idempotencyKey).toBe(key);
    });
  });
});
