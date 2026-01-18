import { PrismaClient } from "@prisma/client";

// SAFETY: Only allow DB reset in test environment
if (process.env.NODE_ENV && process.env.NODE_ENV !== "test") {
  throw new Error(
    "SECURITY_VIOLATION: resetDb can only be used in test environment",
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required for test utilities");
}

export const prismaUnsafe = new PrismaClient();

/**
 * Resets the database using TRUNCATE for speed and reliability.
 * Falls back to deleteMany if TRUNCATE fails.
 * This bypasses tenant isolation - TEST ONLY.
 */
export async function resetDb() {
  try {
    // Preferred: TRUNCATE for speed and CASCADE handling
    await prismaUnsafe.$executeRawUnsafe(`
      TRUNCATE TABLE 
        workflow_trigger_events,
        workflow_triggers,
        workflow_execution_logs,
        workflow_instances,
        workflow_transitions,
        workflow_states,
        workflow_definitions,
        leads,
        tasks,
        refresh_tokens,
        permissions,
        user_roles,
        roles,
        users,
        organizations
      RESTART IDENTITY CASCADE
    `);
  } catch (error) {
    // Fallback: deleteMany in FK-safe order
    console.warn("TRUNCATE failed, falling back to deleteMany:", error);
    await prismaUnsafe.$transaction([
      prismaUnsafe.workflowTriggerEvent.deleteMany(),
      prismaUnsafe.workflowTrigger.deleteMany(),
      prismaUnsafe.workflowExecutionLog.deleteMany(),
      prismaUnsafe.workflowInstance.deleteMany(),
      prismaUnsafe.workflowTransition.deleteMany(),
      prismaUnsafe.workflowState.deleteMany(),
      prismaUnsafe.workflowDefinition.deleteMany(),
      prismaUnsafe.lead.deleteMany(),
      prismaUnsafe.task.deleteMany(),
      prismaUnsafe.refreshToken.deleteMany(),
      prismaUnsafe.permission.deleteMany(),
      prismaUnsafe.userRole.deleteMany(),
      prismaUnsafe.role.deleteMany(),
      prismaUnsafe.user.deleteMany(),
      prismaUnsafe.organization.deleteMany(),
    ]);
  }
}

/**
 * Closes the unsafe Prisma client connection.
 * Call this in afterAll hooks.
 */
export async function closeDb() {
  await prismaUnsafe.$disconnect();
}
