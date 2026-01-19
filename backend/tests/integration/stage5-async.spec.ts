import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import {
  PrismaClient,
  WorkflowStatus,
  DeferredExecutionStatus,
} from "@prisma/client";
import { AppModule } from "../../src/app.module";
import { closeDb, resetDb } from "../utils/db";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

/**
 * 🚀 Stage 5 Integration Tests - Asynchronous Execution
 *
 * These tests verify the asynchronous execution system:
 * 1. ScheduledTrigger CRUD operations
 * 2. DeferredExecution lifecycle management
 * 3. Manual retry functionality
 * 4. Cross-Tenant 404 isolation
 *
 * ARCHITECTURE NOTE:
 * - Uses atomic transactions for fixture creation to prevent FK violations
 * - Single PrismaClient instance for entire suite (lifecycle: beforeAll → afterAll)
 * - Unique identifiers per test run to avoid collisions
 * - Centralized seeding in beforeEach after resetDb()
 *
 * @stage Stage 5
 * @gate Gate 4
 */
describe("🚀 Stage 5: Asynchronous Execution", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  // Stable test tenant (reused across tests after resetDb)
  let testOrgId: string;
  let testToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.setGlobalPrefix("api/v1");
    await app.init();

    // Single Prisma client for entire suite
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  beforeEach(async () => {
    // Reset DB to clean state
    await resetDb();

    // Seed stable test org + user using atomic transaction
    // This prevents FK violations by ensuring org exists before user references it
    const passwordHash = await bcrypt.hash("TestPass123!", 10);

    await prisma.$transaction(async (tx) => {
      const testOrg = await tx.organization.create({
        data: {
          name: "Test Organization",
          slug: `test-org-${randomUUID()}`,
          isActive: true,
        },
      });
      testOrgId = testOrg.id;

      await tx.user.create({
        data: {
          email: `test-${randomUUID()}@test.com`,
          passwordHash,
          firstName: "Test",
          lastName: "User",
          organizationId: testOrgId,
          isActive: true,
        },
      });
    });

    // Login and store token for reuse
    // Find the user we just created to get the correct email
    const user = await prisma.user.findFirst({
      where: { organizationId: testOrgId },
    });

    const loginRes2 = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: user!.email, password: "TestPass123!" })
      .expect(200);

    testToken = loginRes2.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await closeDb();
    await app.close();
  });

  describe("✅ Scenario 1: ScheduledTrigger CRUD", () => {
    it("should create scheduled trigger with cron expression", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Cron",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          cronExpression: "0 0 * * *",
          workflowDefinitionId: definition.id,
          description: "Daily trigger",
          timezone: "UTC",
        })
        .expect(201);

      expect(createRes.body).toHaveProperty("id");
      expect(createRes.body.cronExpression).toBe("0 0 * * *");
      expect(createRes.body.isActive).toBe(true);
    });

    it("should create scheduled trigger with delay", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Delay",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          delaySeconds: 3600,
          workflowDefinitionId: definition.id,
          description: "One hour delay",
        })
        .expect(201);

      expect(createRes.body).toHaveProperty("id");
      expect(createRes.body.delaySeconds).toBe(3600);
    });

    it("should read scheduled trigger", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Read",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          cronExpression: "0 0 * * *",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const triggerId = createRes.body.id;

      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/scheduled-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(200);

      expect(getRes.body.id).toBe(triggerId);
      expect(getRes.body.cronExpression).toBe("0 0 * * *");
    });

    it("should update scheduled trigger", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Update",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          cronExpression: "0 0 * * *",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const triggerId = createRes.body.id;

      const updateRes = await request(app.getHttpServer())
        .patch(`/api/v1/scheduled-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          isActive: false,
          description: "Updated description",
        })
        .expect(200);

      expect(updateRes.body.isActive).toBe(false);
      expect(updateRes.body.description).toBe("Updated description");
    });

    it("should delete scheduled trigger", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Delete",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${testToken}`)
        .send({
          cronExpression: "0 0 * * *",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const triggerId = createRes.body.id;

      await request(app.getHttpServer())
        .delete(`/api/v1/scheduled-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/v1/scheduled-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(404);
    });
  });

  describe("✅ Scenario 2: DeferredExecution Lifecycle", () => {
    it("should list deferred executions", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow List",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `test-key-list-${randomUUID()}`,
          status: DeferredExecutionStatus.PENDING,
          scheduledFor: new Date(),
          organizationId: testOrgId,
        },
      });

      const listRes = await request(app.getHttpServer())
        .get("/api/v1/deferred-executions")
        .set("Authorization", `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(listRes.body)).toBe(true);
      expect(listRes.body.length).toBeGreaterThan(0);
    });

    it("should get single deferred execution", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Get",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const execution = await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `test-key-get-${randomUUID()}`,
          status: DeferredExecutionStatus.PENDING,
          scheduledFor: new Date(),
          organizationId: testOrgId,
        },
      });

      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/deferred-executions/${execution.id}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(200);

      expect(getRes.body.id).toBe(execution.id);
      expect(getRes.body.status).toBe("PENDING");
    });

    it("should get execution attempts", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Attempts",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const execution = await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `test-key-attempts-${randomUUID()}`,
          status: DeferredExecutionStatus.FAILED,
          scheduledFor: new Date(),
          organizationId: testOrgId,
        },
      });

      await prisma.executionAttempt.create({
        data: {
          deferredExecutionId: execution.id,
          attemptNumber: 1,
          status: "FAILED",
          errorMessage: "Test error",
          organizationId: testOrgId,
        },
      });

      const attemptsRes = await request(app.getHttpServer())
        .get(`/api/v1/deferred-executions/${execution.id}/attempts`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(200);

      expect(Array.isArray(attemptsRes.body)).toBe(true);
      expect(attemptsRes.body.length).toBe(1);
      expect(attemptsRes.body[0].attemptNumber).toBe(1);
    });
  });

  describe("✅ Scenario 3: Manual Retry", () => {
    it("should retry failed execution", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Retry",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const execution = await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `test-key-retry-${randomUUID()}`,
          status: DeferredExecutionStatus.FAILED,
          scheduledFor: new Date(),
          organizationId: testOrgId,
        },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/deferred-executions/${execution.id}/retry`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(201);

      const updated = await prisma.deferredExecution.findUnique({
        where: { id: execution.id },
      });

      expect(updated!.status).toBe(DeferredExecutionStatus.PENDING);
    });

    it("should reject retry of completed execution", async () => {
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow Retry Reject",
          status: WorkflowStatus.ACTIVE,
          organizationId: testOrgId,
        },
      });

      const execution = await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `test-key-retry-reject-${randomUUID()}`,
          status: DeferredExecutionStatus.COMPLETED,
          scheduledFor: new Date(),
          organizationId: testOrgId,
        },
      });

      await request(app.getHttpServer())
        .post(`/api/v1/deferred-executions/${execution.id}/retry`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(400);
    });
  });

  describe("🔒 Scenario 4: Cross-Tenant Isolation (404)", () => {
    it("should return 404 when attacker reads victim scheduled trigger", async () => {
      // Create victim org + user in atomic transaction
      const passwordHash = await bcrypt.hash("TestPass123!", 10);
      let victimOrgId: string;
      let victimEmail: string;

      await prisma.$transaction(async (tx) => {
        const victimOrg = await tx.organization.create({
          data: {
            name: "Victim Organization",
            slug: `victim-org-${randomUUID()}`,
            isActive: true,
          },
        });
        victimOrgId = victimOrg.id;

        victimEmail = `victim-${randomUUID()}@test.com`;
        await tx.user.create({
          data: {
            email: victimEmail,
            passwordHash,
            firstName: "Victim",
            lastName: "User",
            organizationId: victimOrgId,
            isActive: true,
          },
        });
      });

      const victimLoginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: victimEmail, password: "TestPass123!" })
        .expect(200);

      const victimToken = victimLoginRes.body.accessToken;

      // Victim creates scheduled trigger
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Victim Workflow",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          cronExpression: "0 0 * * *",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const triggerId = createRes.body.id;

      // Attacker (testToken from different org) tries to read → 404
      await request(app.getHttpServer())
        .get(`/api/v1/scheduled-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(404);
    });

    it("should return 404 when attacker deletes victim scheduled trigger", async () => {
      const passwordHash = await bcrypt.hash("TestPass123!", 10);
      let victimOrgId: string;
      let victimEmail: string;

      await prisma.$transaction(async (tx) => {
        const victimOrg = await tx.organization.create({
          data: {
            name: "Victim Organization 2",
            slug: `victim-org-2-${randomUUID()}`,
            isActive: true,
          },
        });
        victimOrgId = victimOrg.id;

        victimEmail = `victim2-${randomUUID()}@test.com`;
        await tx.user.create({
          data: {
            email: victimEmail,
            passwordHash,
            firstName: "Victim",
            lastName: "User2",
            organizationId: victimOrgId,
            isActive: true,
          },
        });
      });

      const victimLoginRes = await request(app.getHttpServer())
        .post("/api/v1/auth/login")
        .send({ email: victimEmail, password: "TestPass123!" })
        .expect(200);

      const victimToken = victimLoginRes.body.accessToken;

      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Victim Workflow 2",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      const createRes = await request(app.getHttpServer())
        .post("/api/v1/scheduled-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          cronExpression: "0 0 * * *",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const triggerId = createRes.body.id;

      // Attacker tries to delete → 404
      await request(app.getHttpServer())
        .delete(`/api/v1/scheduled-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(404);
    });

    it("should return 404 when attacker reads victim deferred execution", async () => {
      let victimOrgId: string;

      await prisma.$transaction(async (tx) => {
        const victimOrg = await tx.organization.create({
          data: {
            name: "Victim Organization 3",
            slug: `victim-org-3-${randomUUID()}`,
            isActive: true,
          },
        });
        victimOrgId = victimOrg.id;
      });

      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Victim Workflow 3",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      const execution = await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `victim-key-3-${randomUUID()}`,
          status: DeferredExecutionStatus.PENDING,
          scheduledFor: new Date(),
          organizationId: victimOrgId,
        },
      });

      // Attacker tries to read → 404
      await request(app.getHttpServer())
        .get(`/api/v1/deferred-executions/${execution.id}`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(404);
    });

    it("should return 404 when attacker retries victim execution", async () => {
      let victimOrgId: string;

      await prisma.$transaction(async (tx) => {
        const victimOrg = await tx.organization.create({
          data: {
            name: "Victim Organization 4",
            slug: `victim-org-4-${randomUUID()}`,
            isActive: true,
          },
        });
        victimOrgId = victimOrg.id;
      });

      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Victim Workflow 4",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      const execution = await prisma.deferredExecution.create({
        data: {
          workflowDefinitionId: definition.id,
          idempotencyKey: `victim-key-4-${randomUUID()}`,
          status: DeferredExecutionStatus.FAILED,
          scheduledFor: new Date(),
          organizationId: victimOrgId,
        },
      });

      // Attacker tries to retry → 404
      await request(app.getHttpServer())
        .post(`/api/v1/deferred-executions/${execution.id}/retry`)
        .set("Authorization", `Bearer ${testToken}`)
        .expect(404);
    });
  });
});
