import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

/**
 * Test Fixtures Helper
 *
 * Creates test data for E2E tests using prismaUnsafe.
 * SECURITY: Only allowed in test environment (guarded by db.ts).
 */

export interface TestUser {
  id: string;
  email: string;
  organizationId: string;
}

export interface TestOrg {
  id: string;
  name: string;
  slug: string;
}

export interface TestRole {
  id: string;
  name: string;
  organizationId: string;
}

export interface VictimAttackerFixture {
  victim: {
    user: TestUser;
    org: TestOrg;
    role: TestRole;
  };
  attacker: {
    user: TestUser;
    org: TestOrg;
    role: TestRole;
  };
}

/**
 * Seeds victim and attacker organizations with users and roles.
 * Returns structured fixture data for test assertions.
 */
export async function seedVictimAndAttacker(
  prismaUnsafe: PrismaClient,
): Promise<VictimAttackerFixture> {
  // Create VICTIM organization
  const victimOrg = await prismaUnsafe.organization.create({
    data: { name: "Victim Corp", slug: "victim-corp" },
  });

  // Create victim admin role
  const victimRole = await prismaUnsafe.role.create({
    data: {
      name: "Admin",
      description: "Victim admin",
      organizationId: victimOrg.id,
    },
  });

  // Create victim user
  const passwordHash = await bcrypt.hash("VictimPass123!", 10);
  const victimUser = await prismaUnsafe.user.create({
    data: {
      email: "victim@target.com",
      passwordHash,
      firstName: "Victim",
      lastName: "User",
      organizationId: victimOrg.id,
      roles: {
        create: {
          roleId: victimRole.id,
        },
      },
    },
  });

  // Create ATTACKER organization
  const attackerOrg = await prismaUnsafe.organization.create({
    data: { name: "Evil Corp", slug: "evil-corp" },
  });

  // Create attacker admin role
  const attackerRole = await prismaUnsafe.role.create({
    data: {
      name: "Admin",
      description: "Attacker admin",
      organizationId: attackerOrg.id,
    },
  });

  // Create attacker user
  const attackerPasswordHash = await bcrypt.hash("AttackerPass123!", 10);
  const attackerUser = await prismaUnsafe.user.create({
    data: {
      email: "attacker@evil.com",
      passwordHash: attackerPasswordHash,
      firstName: "Attacker",
      lastName: "Malicious",
      organizationId: attackerOrg.id,
      roles: {
        create: {
          roleId: attackerRole.id,
        },
      },
    },
  });

  return {
    victim: {
      user: {
        id: victimUser.id,
        email: victimUser.email,
        organizationId: victimOrg.id,
      },
      org: {
        id: victimOrg.id,
        name: victimOrg.name,
        slug: victimOrg.slug,
      },
      role: {
        id: victimRole.id,
        name: victimRole.name,
        organizationId: victimOrg.id,
      },
    },
    attacker: {
      user: {
        id: attackerUser.id,
        email: attackerUser.email,
        organizationId: attackerOrg.id,
      },
      org: {
        id: attackerOrg.id,
        name: attackerOrg.name,
        slug: attackerOrg.slug,
      },
      role: {
        id: attackerRole.id,
        name: attackerRole.name,
        organizationId: attackerOrg.id,
      },
    },
  };
}
