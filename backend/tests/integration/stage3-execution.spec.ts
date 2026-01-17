import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PrismaClient, WorkflowStatus } from "@prisma/client";
import { AppModule } from "../../src/app.module";
import { resetDb, closeDb } from "../utils/db";
import * as bcrypt from "bcrypt";

/**
 * 🚀 Stage 3 Integration Tests - Workflow Execution Runtime
 *
 * These tests verify the workflow runtime execution engine:
 * 1. Happy Path: Start → Transition → Complete
 * 2. Invalid Transition: Attempt invalid state jump
 * 3. Start from DRAFT: Cannot start instances from DRAFT definitions
 * 4. Cross-Tenant 404: Tenant isolation for instances
 *
 * @stage Stage 3
 * @gate Gate 4
 */
describe("🚀 Stage 3: Workflow Execution Runtime", () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  // Organization A (Primary Test Tenant)
  let orgAId: string;
  let userAId: string;
  let tokenA: string;

  // Organization B (Cross-Tenant Test)
  let orgBId: string;
  let userBId: string;
  let tokenB: string;

  // Workflow fixtures
  let activeDefinitionId: string;
  let draftDefinitionId: string;
  let startStateId: string;
  let middleStateId: string;
  let endStateId: string;
  let transitionToMiddleId: string;
  let transitionToEndId: string;

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
    // CREATE ORGANIZATION A + USER A
    // ============================================================
    const orgA = await prisma.organization.create({
      data: {
        name: "Test Organization A",
        slug: "test-org-a",
        isActive: true,
      },
    });
    orgAId = orgA.id;

    const passwordHash = await bcrypt.hash("TestPass123!", 10);
    const userA = await prisma.user.create({
      data: {
        email: "user.a@test.com",
        passwordHash,
        firstName: "User",
        lastName: "A",
        organizationId: orgAId,
        isActive: true,
      },
    });
    userAId = userA.id;

    // Login User A
    const loginA = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "user.a@test.com", password: "TestPass123!" })
      .expect(200);
    tokenA = loginA.body.accessToken;

    // ============================================================
    // CREATE ORGANIZATION B + USER B (Cross-Tenant)
    // ============================================================
    const orgB = await prisma.organization.create({
      data: {
        name: "Test Organization B",
        slug: "test-org-b",
        isActive: true,
      },
    });
    orgBId = orgB.id;

    const userB = await prisma.user.create({
      data: {
        email: "user.b@test.com",
        passwordHash,
        firstName: "User",
        lastName: "B",
        organizationId: orgBId,
        isActive: true,
      },
    });
    userBId = userB.id;

    // Login User B
    const loginB = await request(app.getHttpServer())
      .post("/api/v1/auth/login")
      .send({ email: "user.b@test.com", password: "TestPass123!" })
      .expect(200);
    tokenB = loginB.body.accessToken;

    // ============================================================
    // CREATE ACTIVE WORKFLOW DEFINITION (with states + transitions)
    // ============================================================
    const activeDefinition = await prisma.workflowDefinition.create({
      data: {
        name: "Active Test Workflow",
        description: "A simple start → middle → end workflow",
        status: WorkflowStatus.ACTIVE,
        organizationId: orgAId,
      },
    });
    activeDefinitionId = activeDefinition.id;

    // Create states: Start → Middle → End
    const startState = await prisma.workflowState.create({
      data: {
        workflowDefinitionId: activeDefinitionId,
        name: "Start",
        isStart: true,
        isEnd: false,
      },
    });
    startStateId = startState.id;

    const middleState = await prisma.workflowState.create({
      data: {
        workflowDefinitionId: activeDefinitionId,
        name: "In Progress",
        isStart: false,
        isEnd: false,
      },
    });
    middleStateId = middleState.id;

    const endState = await prisma.workflowState.create({
      data: {
        workflowDefinitionId: activeDefinitionId,
        name: "Completed",
        isStart: false,
        isEnd: true,
      },
    });
    endStateId = endState.id;

    // Create transitions: Start → Middle, Middle → End
    const transitionToMiddle = await prisma.workflowTransition.create({
      data: {
        workflowDefinitionId: activeDefinitionId,
        fromStateId: startStateId,
        toStateId: middleStateId,
        label: "Begin Work",
      },
    });
    transitionToMiddleId = transitionToMiddle.id;

    const transitionToEnd = await prisma.workflowTransition.create({
      data: {
        workflowDefinitionId: activeDefinitionId,
        fromStateId: middleStateId,
        toStateId: endStateId,
        label: "Complete Work",
      },
    });
    transitionToEndId = transitionToEnd.id;

    // ============================================================
    // CREATE DRAFT WORKFLOW DEFINITION (for negative test)
    // ============================================================
    const draftDefinition = await prisma.workflowDefinition.create({
      data: {
        name: "Draft Test Workflow",
        description: "A draft workflow that cannot be started",
        status: WorkflowStatus.DRAFT,
        organizationId: orgAId,
      },
    });
    draftDefinitionId = draftDefinition.id;

    // Add a start state to the draft (it still shouldn't be startable)
    await prisma.workflowState.create({
      data: {
        workflowDefinitionId: draftDefinitionId,
        name: "Draft Start",
        isStart: true,
        isEnd: false,
      },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
    await closeDb();
  });

  // ============================================================
  // SCENARIO 1: HAPPY PATH
  // Start → Transition to Middle → Transition to End → COMPLETED
  // ============================================================
  describe("✅ Scenario 1: Happy Path (Start → Transition → Complete)", () => {
    it("should create a new workflow instance from ACTIVE definition", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
      expect(response.body.status).toBe("RUNNING");
      expect(response.body.currentStateId).toBe(startStateId);
      expect(response.body.workflowDefinitionId).toBe(activeDefinitionId);
    });

    it("should transition from Start to Middle state", async () => {
      // Create instance first
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      // Transition to middle state
      const transitionRes = await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToMiddleId });

      expect(transitionRes.status).toBe(201);
      expect(transitionRes.body.currentStateId).toBe(middleStateId);
      expect(transitionRes.body.status).toBe("RUNNING");
    });

    it("should complete the workflow when transitioning to end state", async () => {
      // Create instance
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      // Transition Start → Middle
      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToMiddleId })
        .expect(201);

      // Transition Middle → End
      const finalRes = await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToEndId });

      expect(finalRes.status).toBe(201);
      expect(finalRes.body.currentStateId).toBe(endStateId);
      expect(finalRes.body.status).toBe("COMPLETED");
    });

    it("should return correct instance status after completion", async () => {
      // Full flow: Create → Middle → End
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToMiddleId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToEndId })
        .expect(201);

      // GET instance status
      const getRes = await request(app.getHttpServer())
        .get(`/api/v1/workflow-instances/${instanceId}`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.status).toBe("COMPLETED");
      expect(getRes.body.currentState.name).toBe("Completed");
    });

    it("should return execution history in ascending order", async () => {
      // Create and complete workflow
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToMiddleId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToEndId })
        .expect(201);

      // GET history
      const historyRes = await request(app.getHttpServer())
        .get(`/api/v1/workflow-instances/${instanceId}/history`)
        .set("Authorization", `Bearer ${tokenA}`);

      expect(historyRes.status).toBe(200);
      expect(historyRes.body.length).toBe(3); // Create + 2 transitions

      // Verify order (ascending by timestamp)
      const logs = historyRes.body;
      expect(logs[0].toStateId).toBe(startStateId); // Creation log
      expect(logs[1].toStateId).toBe(middleStateId); // First transition
      expect(logs[2].toStateId).toBe(endStateId); // Second transition
    });
  });

  // ============================================================
  // SCENARIO 2: INVALID TRANSITION
  // ============================================================
  describe("❌ Scenario 2: Invalid Transition", () => {
    it("should reject transition with invalid transitionId", async () => {
      // Create instance
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      // Try to use End transition from Start state (invalid)
      const response = await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToEndId }); // This requires Middle state

      expect(response.status).toBe(400);
    });

    it("should reject transition on COMPLETED instance", async () => {
      // Complete a workflow
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToMiddleId })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToEndId })
        .expect(201);

      // Try to transition again (should fail - already COMPLETED)
      const response = await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: transitionToMiddleId });

      expect(response.status).toBe(400);
    });

    it("should reject transition with non-existent transitionId", async () => {
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      const response = await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ transitionId: "non-existent-transition-id" });

      expect(response.status).toBe(400);
    });
  });

  // ============================================================
  // SCENARIO 3: START FROM DRAFT
  // ============================================================
  describe("📝 Scenario 3: Start from DRAFT Definition", () => {
    it("should reject starting instance from DRAFT definition", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: draftDefinitionId });

      expect(response.status).toBe(400);
    });
  });

  // ============================================================
  // SCENARIO 4: CROSS-TENANT 404
  // User B cannot access User A's workflow instances
  // ============================================================
  describe("🔒 Scenario 4: Cross-Tenant Isolation (404)", () => {
    it("should return 404 when User B tries to GET User A's instance", async () => {
      // User A creates an instance
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      // User B tries to access it
      const response = await request(app.getHttpServer())
        .get(`/api/v1/workflow-instances/${instanceId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(response.status).toBe(404);
    });

    it("should return 404 when User B tries to GET User A's instance history", async () => {
      // User A creates an instance
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      // User B tries to access history
      const response = await request(app.getHttpServer())
        .get(`/api/v1/workflow-instances/${instanceId}/history`)
        .set("Authorization", `Bearer ${tokenB}`);

      expect(response.status).toBe(404);
    });

    it("should return 404 when User B tries to transition User A's instance", async () => {
      // User A creates an instance
      const createRes = await request(app.getHttpServer())
        .post("/api/v1/workflow-instances")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ workflowDefinitionId: activeDefinitionId })
        .expect(201);

      const instanceId = createRes.body.id;

      // User B tries to transition it
      const response = await request(app.getHttpServer())
        .post(`/api/v1/workflow-instances/${instanceId}/transition`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ transitionId: transitionToMiddleId });

      expect(response.status).toBe(404);
    });
  });
});
