import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PrismaClient, WorkflowStatus } from "@prisma/client";
import { AppModule } from "../../src/app.module";
import { resetDb, closeDb } from "../utils/db";
import * as bcrypt from "bcrypt";

/**
 * 🚀 Stage 4 Integration Tests - Workflow Triggers & Automation
 *
 * These tests verify the workflow trigger system:
 * 1. Happy Path: Create trigger + fire event → instance created
 * 2. Missing Trigger: Fire event with no trigger → 404
 * 3. Inactive Trigger: Fire event on inactive trigger → 400
 * 4. Definition Not ACTIVE: Trigger points to non-ACTIVE definition → 400
 * 5. Cross-Tenant 404: Tenant isolation for triggers and events
 *
 * @stage Stage 4
 * @gate Gate 4
 */
describe("🚀 Stage 4: Workflow Triggers & Automation", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  // Victim Organization (Primary Test Tenant)
  let victimOrgId: string;
  let victimToken: string;

  // Attacker Organization (Cross-Tenant Test)
  let attackerOrgId: string;
  let attackerToken: string;

  beforeAll(async () => {
    // Setup App
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

    // Connect raw client for fixtures
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  beforeEach(async () => {
    await resetDb();

    // ============================================================
    // CREATE VICTIM ORGANIZATION + USER
    // ============================================================
    const victimOrg = await prisma.organization.create({
      data: {
        name: "Victim Organization",
        slug: "victim-org",
        isActive: true,
      },
    });
    victimOrgId = victimOrg.id;

    const passwordHash = await bcrypt.hash("TestPass123!", 10);
    await prisma.user.create({
      data: {
        email: "victim@test.com",
        passwordHash,
        firstName: "Victim",
        lastName: "User",
        organizationId: victimOrgId,
        isActive: true,
      },
    });

    // Login Victim
    const loginVictim = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "victim@test.com", password: "TestPass123!" })
      .expect(200);
    victimToken = loginVictim.body.accessToken;

    // ============================================================
    // CREATE ATTACKER ORGANIZATION + USER (Cross-Tenant)
    // ============================================================
    const attackerOrg = await prisma.organization.create({
      data: {
        name: "Attacker Organization",
        slug: "attacker-org",
        isActive: true,
      },
    });
    attackerOrgId = attackerOrg.id;

    await prisma.user.create({
      data: {
        email: "attacker@test.com",
        passwordHash,
        firstName: "Attacker",
        lastName: "User",
        organizationId: attackerOrgId,
        isActive: true,
      },
    });

    // Login Attacker
    const loginAttacker = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "attacker@test.com", password: "TestPass123!" })
      .expect(200);
    attackerToken = loginAttacker.body.accessToken;

    // Integrity assertions
    expect(victimOrgId).toBeDefined();
    expect(attackerOrgId).toBeDefined();
    expect(victimOrgId).not.toEqual(attackerOrgId);
  });

  afterAll(async () => {
    await closeDb();
    await app.close();
  });

  // ============================================================
  // SCENARIO 1: HAPPY PATH
  // ============================================================
  describe("✅ Scenario 1: Happy Path (Create Trigger + Fire Event)", () => {
    it("should create trigger and fire event to create workflow instance", async () => {
      // Create ACTIVE workflow definition
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow",
          description: "Test workflow for triggers",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      // Create start state
      const startState = await prisma.workflowState.create({
        data: {
          workflowDefinitionId: definition.id,
          name: "Start",
          isStart: true,
          isEnd: false,
        },
      });

      // Create trigger
      const createTriggerRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "lead.created",
          workflowDefinitionId: definition.id,
          description: "Trigger on lead creation",
        })
        .expect(201);

      expect(createTriggerRes.body).toHaveProperty("id");
      expect(createTriggerRes.body.eventKey).toBe("lead.created");
      expect(createTriggerRes.body.isActive).toBe(true);

      // Fire event
      const fireEventRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers/events")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "lead.created",
          payload: { leadId: "test-lead-123" },
        })
        .expect(201);

      expect(fireEventRes.body).toHaveProperty("eventId");
      expect(fireEventRes.body).toHaveProperty("workflowInstanceId");
      expect(fireEventRes.body).toHaveProperty("triggerId");
      expect(fireEventRes.body.eventKey).toBe("lead.created");

      // Verify instance was created
      const instance = await prisma.workflowInstance.findUnique({
        where: { id: fireEventRes.body.workflowInstanceId },
      });

      expect(instance).toBeDefined();
      expect(instance!.organizationId).toBe(victimOrgId);
      expect(instance!.workflowDefinitionId).toBe(definition.id);
      expect(instance!.currentStateId).toBe(startState.id);
    });
  });

  // ============================================================
  // SCENARIO 2: MISSING TRIGGER -> 404
  // ============================================================
  describe("❌ Scenario 2: Missing Trigger", () => {
    it("should return 404 when firing event with no trigger", async () => {
      await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers/events")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "nonexistent.event",
        })
        .expect(404);
    });
  });

  // ============================================================
  // SCENARIO 3: INACTIVE TRIGGER -> 400
  // ============================================================
  describe("❌ Scenario 3: Inactive Trigger", () => {
    it("should return 400 when firing event on inactive trigger", async () => {
      // Create ACTIVE workflow definition
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      // Create start state
      await prisma.workflowState.create({
        data: {
          workflowDefinitionId: definition.id,
          name: "Start",
          isStart: true,
          isEnd: false,
        },
      });

      // Create trigger
      const createTriggerRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "test.event",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const triggerId = createTriggerRes.body.id;

      // Deactivate trigger
      await request(app.getHttpServer())
        .patch(`/api/v1/workflow-triggers/${triggerId}`)
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          isActive: false,
        })
        .expect(200);

      // Fire event on inactive trigger
      await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers/events")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "test.event",
        })
        .expect(400);
    });
  });

  // ============================================================
  // SCENARIO 4: DEFINITION NOT ACTIVE -> 400
  // ============================================================
  describe("❌ Scenario 4: Definition Not ACTIVE", () => {
    it("should return 400 when trigger points to non-ACTIVE definition", async () => {
      // Create DRAFT workflow definition
      const draftDefinition = await prisma.workflowDefinition.create({
        data: {
          name: "Draft Workflow",
          status: WorkflowStatus.DRAFT,
          organizationId: victimOrgId,
        },
      });

      // Create start state
      await prisma.workflowState.create({
        data: {
          workflowDefinitionId: draftDefinition.id,
          name: "Start",
          isStart: true,
          isEnd: false,
        },
      });

      // Attempt to create trigger for DRAFT definition
      await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "draft.event",
          workflowDefinitionId: draftDefinition.id,
        })
        .expect(400);
    });

    it("should return 400 when definition becomes non-ACTIVE after trigger creation", async () => {
      // Create ACTIVE workflow definition
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Test Workflow",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      // Create start state
      await prisma.workflowState.create({
        data: {
          workflowDefinitionId: definition.id,
          name: "Start",
          isStart: true,
          isEnd: false,
        },
      });

      // Create trigger while definition is ACTIVE
      await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "test.event",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      // Archive the definition
      await prisma.workflowDefinition.update({
        where: { id: definition.id },
        data: { status: WorkflowStatus.ARCHIVED },
      });

      // Fire event should fail
      await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers/events")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "test.event",
        })
        .expect(400);
    });
  });

  // ============================================================
  // SCENARIO 5: CROSS-TENANT ACCESS -> 404 (NOT 403)
  // ============================================================
  describe("🔒 Scenario 5: Cross-Tenant Isolation (404)", () => {
    it("should return 404 when attacker tries to access victim trigger", async () => {
      // Victim creates ACTIVE workflow definition
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Victim Workflow",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      // Create start state
      await prisma.workflowState.create({
        data: {
          workflowDefinitionId: definition.id,
          name: "Start",
          isStart: true,
          isEnd: false,
        },
      });

      // Victim creates trigger
      const createTriggerRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "victim.event",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      const victimTriggerId = createTriggerRes.body.id;

      // Attacker tries to GET victim's trigger
      await request(app.getHttpServer())
        .get(`/api/v1/workflow-triggers/${victimTriggerId}`)
        .set("Authorization", `Bearer ${attackerToken}`)
        .expect(404); // NOT 403
    });

    it("should return 404 when attacker tries to access victim trigger event", async () => {
      // Victim creates ACTIVE workflow definition
      const definition = await prisma.workflowDefinition.create({
        data: {
          name: "Victim Workflow",
          status: WorkflowStatus.ACTIVE,
          organizationId: victimOrgId,
        },
      });

      // Create start state
      await prisma.workflowState.create({
        data: {
          workflowDefinitionId: definition.id,
          name: "Start",
          isStart: true,
          isEnd: false,
        },
      });

      // Victim creates trigger
      await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "victim.event",
          workflowDefinitionId: definition.id,
        })
        .expect(201);

      // Victim fires event
      const fireEventRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-triggers/events")
        .set("Authorization", `Bearer ${victimToken}`)
        .send({
          eventKey: "victim.event",
        })
        .expect(201);

      const victimEventId = fireEventRes.body.eventId;

      // Attacker tries to GET victim's event
      await request(app.getHttpServer())
        .get(`/api/v1/workflow-triggers/events/${victimEventId}`)
        .set("Authorization", `Bearer ${attackerToken}`)
        .expect(404); // NOT 403
    });
  });
});
