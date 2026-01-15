import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { JwtService } from "@nestjs/jwt";
import { AppModule } from "../../src/app.module";
import { resetDb, closeDb, prismaUnsafe } from "../utils/db";
import {
  seedVictimAndAttacker,
  VictimAttackerFixture,
} from "../utils/fixtures";

/**
 * 🔓 Security Penetration Tests
 *
 * These tests verify that common attack vectors are blocked:
 * 1. IDOR (Insecure Direct Object Reference) on tenant-scoped entities
 * 2. organizationId injection attacks
 * 3. Cross-tenant data enumeration prevention
 * 4. Token manipulation and authentication bypass
 *
 * NOTE: Uses prismaUnsafe for test setup/teardown only (guarded by NODE_ENV=test).
 * All tested endpoints exist in Stage 1+2 allowlist.
 *
 * @security Run these tests on every security-related PR
 */
describe("🔓 Security Penetration Tests", () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let fixtures: VictimAttackerFixture;
  let victimToken: string;
  let attackerToken: string;

  /**
   * Helper: Create JWT token using NestJS JwtService
   */
  function createAuthToken(
    userId: string,
    email: string,
    orgId: string,
  ): string {
    return jwtService.sign({
      sub: userId,
      email,
      organizationId: orgId,
    });
  }

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

    // Get JwtService for token generation
    jwtService = app.get(JwtService);
  });

  beforeEach(async () => {
    await resetDb();

    // Seed victim and attacker fixtures
    fixtures = await seedVictimAndAttacker(prismaUnsafe);

    // Generate auth tokens using JwtService
    victimToken = createAuthToken(
      fixtures.victim.user.id,
      fixtures.victim.user.email,
      fixtures.victim.org.id,
    );

    attackerToken = createAuthToken(
      fixtures.attacker.user.id,
      fixtures.attacker.user.email,
      fixtures.attacker.org.id,
    );
  });

  afterAll(async () => {
    await app.close();
    await closeDb();
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 🎯 IDOR ATTACKS - Tenant-Scoped Entity Isolation
  // ══════════════════════════════════════════════════════════════════════════

  describe("🎯 IDOR Attacks (Tenant-Scoped Entities)", () => {
    it("ATTACK: Enumerate victim users via GET /users", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${attackerToken}`);

      expect(response.status).toBe(200);
      const users = response.body;

      // Should NOT contain victim's users
      const victimLeaks = users.filter(
        (u: any) => u.organizationId === fixtures.victim.org.id,
      );
      expect(victimLeaks.length).toBe(0);

      // Should only contain attacker's users
      users.forEach((user: any) => {
        expect(user.organizationId).toBe(fixtures.attacker.org.id);
      });
    });

    it("ATTACK: Enumerate victim roles via GET /roles", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/roles")
        .set("Authorization", `Bearer ${attackerToken}`);

      expect(response.status).toBe(200);
      const roles = response.body;

      // Should NOT contain victim's roles
      const victimRoleLeaks = roles.filter(
        (r: any) => r.organizationId === fixtures.victim.org.id,
      );
      expect(victimRoleLeaks.length).toBe(0);

      // Should only contain attacker's roles
      roles.forEach((role: any) => {
        expect(role.organizationId).toBe(fixtures.attacker.org.id);
      });
    });

    it("ATTACK: Enumerate victim workflows via GET /workflows", async () => {
      // Create a workflow in victim's org
      await prismaUnsafe.workflowDefinition.create({
        data: {
          name: "Secret Workflow",
          description: "Confidential process",
          organizationId: fixtures.victim.org.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get("/api/v1/workflows")
        .set("Authorization", `Bearer ${attackerToken}`);

      expect(response.status).toBe(200);
      const workflows = response.body;

      // Should NOT contain victim's workflows
      const victimWorkflowLeaks = workflows.filter(
        (w: any) => w.organizationId === fixtures.victim.org.id,
      );
      expect(victimWorkflowLeaks.length).toBe(0);
    });

    it("ATTACK: Access victim role permissions via GET /roles/:roleId/permissions", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/roles/${fixtures.victim.role.id}/permissions`)
        .set("Authorization", `Bearer ${attackerToken}`);

      // Should be blocked - 404 (role not found in attacker's context)
      expect(response.status).toBe(404);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 💉 ORGANIZATIONID INJECTION ATTACKS
  // ══════════════════════════════════════════════════════════════════════════

  describe("💉 organizationId Injection Attacks", () => {
    it("ATTACK: Inject victim orgId when creating user", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${attackerToken}`)
        .send({
          email: "injected@test.com",
          password: "InjectedPass123!",
          firstName: "Injected",
          lastName: "User",
          organizationId: fixtures.victim.org.id, // ⚠️ MALICIOUS INJECTION
        });

      // Request should succeed BUT with attacker's org, not victim's
      expect(response.status).toBe(201);
      expect(response.body.organizationId).toBe(fixtures.attacker.org.id);
      expect(response.body.organizationId).not.toBe(fixtures.victim.org.id);
    });

    it("ATTACK: Inject victim orgId when creating role", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/roles")
        .set("Authorization", `Bearer ${attackerToken}`)
        .send({
          name: "Injected Role",
          description: "Malicious role",
          organizationId: fixtures.victim.org.id, // ⚠️ MALICIOUS INJECTION
        });

      // Request should succeed BUT with attacker's org, not victim's
      expect(response.status).toBe(201);
      expect(response.body.organizationId).toBe(fixtures.attacker.org.id);
      expect(response.body.organizationId).not.toBe(fixtures.victim.org.id);
    });

    it("ATTACK: Inject victim orgId when creating workflow", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/workflows")
        .set("Authorization", `Bearer ${attackerToken}`)
        .send({
          name: "Injected Workflow",
          description: "Malicious workflow",
          organizationId: fixtures.victim.org.id, // ⚠️ MALICIOUS INJECTION
        });

      // Request should succeed BUT with attacker's org, not victim's
      expect(response.status).toBe(201);
      expect(response.body.organizationId).toBe(fixtures.attacker.org.id);
      expect(response.body.organizationId).not.toBe(fixtures.victim.org.id);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 🔐 AUTHENTICATION BYPASS ATTACKS
  // ══════════════════════════════════════════════════════════════════════════

  describe("🔐 Authentication Bypass Attacks", () => {
    it("ATTACK: Access without authentication", async () => {
      const response = await request(app.getHttpServer()).get("/api/v1/users");

      expect(response.status).toBe(401);
    });

    it("ATTACK: Use invalid/malformed token", async () => {
      // Fake JWT (not signed with server secret)
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwib3JnYW5pemF0aW9uSWQiOiJ2aWN0aW0tb3JnLWlkIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid";

      const response = await request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
    });

    it("ATTACK: Modify token payload to access victim org", async () => {
      // Create token with victim's orgId but attacker's userId
      const tamperedToken = createAuthToken(
        fixtures.attacker.user.id,
        fixtures.attacker.user.email,
        fixtures.victim.org.id, // ⚠️ MALICIOUS
      );

      const response = await request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${tamperedToken}`);

      // Token is valid but user doesn't belong to that org
      // TenantGuard should detect mismatch and fail OR return empty results
      expect([401, 403, 200]).toContain(response.status);

      if (response.status === 200) {
        // If it succeeds, it should return empty or only attacker's data
        const users = response.body;
        const victimLeaks = users.filter(
          (u: any) => u.organizationId === fixtures.victim.org.id,
        );
        expect(victimLeaks.length).toBe(0);
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ✅ LEGITIMATE ACCESS (CONTROL TESTS)
  // ══════════════════════════════════════════════════════════════════════════

  describe("✅ Legitimate Access (Control Tests)", () => {
    it("Victim CAN list their own users", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${victimToken}`);

      expect(response.status).toBe(200);
      const users = response.body;

      // All users should belong to victim
      users.forEach((user: any) => {
        expect(user.organizationId).toBe(fixtures.victim.org.id);
      });
    });

    it("Victim CAN list their own roles", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/roles")
        .set("Authorization", `Bearer ${victimToken}`);

      expect(response.status).toBe(200);
      const roles = response.body;

      // All roles should belong to victim
      roles.forEach((role: any) => {
        expect(role.organizationId).toBe(fixtures.victim.org.id);
      });
    });

    it("Victim CAN access their own role permissions", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/roles/${fixtures.victim.role.id}/permissions`)
        .set("Authorization", `Bearer ${victimToken}`);

      expect(response.status).toBe(200);
      const permissions = response.body;
      expect(Array.isArray(permissions)).toBe(true);
    });

    it("Victim CAN list their own workflows", async () => {
      // Create a workflow in victim's org
      await prismaUnsafe.workflowDefinition.create({
        data: {
          name: "Victim Workflow",
          description: "Legitimate workflow",
          organizationId: fixtures.victim.org.id,
        },
      });

      const response = await request(app.getHttpServer())
        .get("/api/v1/workflows")
        .set("Authorization", `Bearer ${victimToken}`);

      expect(response.status).toBe(200);
      const workflows = response.body;

      // All workflows should belong to victim
      workflows.forEach((workflow: any) => {
        expect(workflow.organizationId).toBe(fixtures.victim.org.id);
      });
    });
  });
});
