import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { PrismaClient } from "@prisma/client";
import { AppModule } from "../../src/app.module";
import { resetDb, closeDb } from "../utils/db";

/**
 * 🔓 Security Penetration Tests
 *
 * These tests verify that common attack vectors are blocked:
 * 1. IDOR (Insecure Direct Object Reference)
 * 2. organizationId injection
 * 3. Cross-tenant data access
 * 4. Token manipulation
 *
 * NOTE: Uses raw PrismaClient for test setup/teardown (not PrismaService)
 * This is intentional - we need unfiltered access for test fixtures.
 *
 * @security Run these tests on every security-related PR
 */
describe("🔓 Security Penetration Tests", () => {
  let app: INestApplication;
  let prisma: PrismaClient; // Raw client for test setup only

  // Attacker and Victim organizations
  let victimOrgId: string;
  let attackerOrgId: string;
  let victimToken: string;
  let attackerToken: string;
  let victimLeadId: string;

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

    // Create Fixtures using raw prisma (bypassing tenant checks for setup)

    // Create VICTIM organization
    const victimRes = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        email: "victim@target.com",
        password: "VictimPass123!",
        firstName: "Victim",
        lastName: "User",
        organizationName: "Victim Corp",
      })
      .expect(201);

    victimOrgId = victimRes.body.user.organizationId;
    victimToken = victimRes.body.accessToken;

    // Create a SECRET lead in victim's organization
    const victimLead = await prisma.lead.create({
      data: {
        firstName: "CONFIDENTIAL",
        lastName: "SECRET",
        email: "secret@victim.com",
        notes: "HIGHLY SENSITIVE DATA - SALARY $500K",
        organizationId: victimOrgId,
      },
    });
    victimLeadId = victimLead.id;

    // Create ATTACKER organization
    const attackerRes = await request(app.getHttpServer())
      .post("/api/v1/auth/register")
      .send({
        email: "attacker@evil.com",
        password: "AttackerPass123!",
        firstName: "Attacker",
        lastName: "Malicious",
        organizationName: "Evil Corp",
      })
      .expect(201);

    attackerOrgId = attackerRes.body.user.organizationId;
    attackerToken = attackerRes.body.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
    await closeDb();
  });

  describe("🎯 IDOR Attacks (Insecure Direct Object Reference)", () => {
    it("ATTACK: Access victim lead by directly using their ID", async () => {
      // Attacker knows the victim's lead ID and tries to access it
      const response = await request(app.getHttpServer())
        .get(`/api/v1/leads/${victimLeadId}`)
        .set("Authorization", `Bearer ${attackerToken}`);

      // Should be blocked - return 404 (not 403 to prevent enumeration)
      expect(response.status).toBe(404);
      expect(response.body).not.toHaveProperty("notes"); // No sensitive data leaked
    });

    it("ATTACK: Update victim lead by directly using their ID", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/leads/${victimLeadId}`)
        .set("Authorization", `Bearer ${attackerToken}`)
        .send({ notes: "HACKED BY ATTACKER" });

      expect(response.status).toBe(404);

      // Verify data was NOT modified (using raw client for verification)
      const lead = await prisma.lead.findUnique({
        where: { id: victimLeadId },
      });
      expect(lead?.notes).toBe("HIGHLY SENSITIVE DATA - SALARY $500K");
    });

    it("ATTACK: Delete victim lead by directly using their ID", async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/leads/${victimLeadId}`)
        .set("Authorization", `Bearer ${attackerToken}`);

      expect(response.status).toBe(404);

      // Verify lead still exists
      const lead = await prisma.lead.findUnique({
        where: { id: victimLeadId },
      });
      expect(lead).not.toBeNull();
    });
  });

  describe("💉 organizationId Injection Attacks", () => {
    it("ATTACK: Inject victim orgId in request body", async () => {
      const response = await request(app.getHttpServer())
        .post("/api/v1/leads")
        .set("Authorization", `Bearer ${attackerToken}`)
        .send({
          firstName: "Injected",
          lastName: "Lead",
          organizationId: victimOrgId, // ⚠️ MALICIOUS INJECTION
        });

      // Request should succeed BUT with attacker's org, not victim's
      expect(response.status).toBe(201);
      expect(response.body.organizationId).toBe(attackerOrgId);
      expect(response.body.organizationId).not.toBe(victimOrgId);
    });

    it("ATTACK: Inject victim orgId in query string", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/leads?organizationId=${victimOrgId}`)
        .set("Authorization", `Bearer ${attackerToken}`);

      // Should return only attacker's leads, not victim's
      expect(response.status).toBe(200);
      const leads = response.body;

      // Should not contain victim's confidential lead
      const victimLeaks = leads.filter(
        (l: any) => l.organizationId === victimOrgId,
      );
      expect(victimLeaks.length).toBe(0);
    });
  });

  describe("🔐 Authentication Bypass Attacks", () => {
    it("ATTACK: Access without authentication", async () => {
      const response = await request(app.getHttpServer()).get("/api/v1/leads");

      expect(response.status).toBe(401);
    });

    it("ATTACK: Use invalid/expired token", async () => {
      // Fake JWT (not signed with server secret)
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwib3JnYW5pemF0aW9uSWQiOiJ2aWN0aW0tb3JnLWlkIiwiaWF0IjoxNTE2MjM5MDIyfQ.4S5J9";

      const response = await request(app.getHttpServer())
        .get("/api/v1/leads")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
    });

    it("ATTACK: Modify token payload to access victim org", async () => {
      // Even if attacker modifies JWT payload, signature verification should fail
      const tamperedToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhdHRhY2tlci1pZCIsIm9yZ2FuaXphdGlvbklkIjoidmljdGltLW9yZy1pZCIsImVtYWlsIjoiYXR0YWNrZXJAZXZpbC5jb20ifQ.invalid";

      const response = await request(app.getHttpServer())
        .get("/api/v1/leads")
        .set("Authorization", `Bearer ${tamperedToken}`);

      expect(response.status).toBe(401);
    });
  });

  describe("📊 Data Enumeration Prevention", () => {
    it("Should return 404 (not 403) for non-existent resources", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/leads/non-existent-uuid-12345")
        .set("Authorization", `Bearer ${attackerToken}`);

      // 404 prevents attacker from knowing if resource exists
      expect(response.status).toBe(404);
    });

    it("Should return 404 (not 403) for other org resources", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/leads/${victimLeadId}`)
        .set("Authorization", `Bearer ${attackerToken}`);

      // Same 404 response - attacker can't distinguish between
      // "doesn't exist" and "exists but not yours"
      expect(response.status).toBe(404);
    });
  });

  describe("✅ Legitimate Access (Control Tests)", () => {
    it("Victim CAN access their own data", async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/leads/${victimLeadId}`)
        .set("Authorization", `Bearer ${victimToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(victimLeadId);
      expect(response.body.notes).toBe("HIGHLY SENSITIVE DATA - SALARY $500K");
    });

    it("Victim CAN list their own leads", async () => {
      const response = await request(app.getHttpServer())
        .get("/api/v1/leads")
        .set("Authorization", `Bearer ${victimToken}`);

      expect(response.status).toBe(200);
      const leads = response.body;

      // All leads should belong to victim
      leads.forEach((lead: any) => {
        expect(lead.organizationId).toBe(victimOrgId);
      });
    });
  });
});
