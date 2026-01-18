-- CreateEnum
CREATE TYPE "DeferredExecutionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER');

-- CreateEnum
CREATE TYPE "ExecutionAttemptStatus" AS ENUM ('RUNNING', 'SUCCEEDED', 'FAILED', 'TIMEOUT');

-- CreateTable
CREATE TABLE "scheduled_triggers" (
    "id" TEXT NOT NULL,
    "cronExpression" TEXT,
    "delaySeconds" INTEGER,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "workflowDefinitionId" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastExecutedAt" TIMESTAMP(3),
    "nextExecutionAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_triggers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deferred_executions" (
    "id" TEXT NOT NULL,
    "scheduledTriggerId" TEXT,
    "workflowDefinitionId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "status" "DeferredExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledFor" TIMESTAMP(3) NOT NULL,
    "payload" JSONB,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "maxRetries" INTEGER NOT NULL DEFAULT 3,
    "lastAttemptAt" TIMESTAMP(3),
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deferred_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_attempts" (
    "id" TEXT NOT NULL,
    "deferredExecutionId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "status" "ExecutionAttemptStatus" NOT NULL DEFAULT 'RUNNING',
    "errorMessage" TEXT,
    "errorCode" TEXT,
    "workflowInstanceId" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_triggers_organizationId_idx" ON "scheduled_triggers"("organizationId");

-- CreateIndex
CREATE INDEX "scheduled_triggers_isActive_idx" ON "scheduled_triggers"("isActive");

-- CreateIndex
CREATE INDEX "scheduled_triggers_nextExecutionAt_idx" ON "scheduled_triggers"("nextExecutionAt");

-- CreateIndex
CREATE UNIQUE INDEX "deferred_executions_idempotencyKey_key" ON "deferred_executions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "deferred_executions_organizationId_idx" ON "deferred_executions"("organizationId");

-- CreateIndex
CREATE INDEX "deferred_executions_status_idx" ON "deferred_executions"("status");

-- CreateIndex
CREATE INDEX "deferred_executions_scheduledFor_idx" ON "deferred_executions"("scheduledFor");

-- CreateIndex
CREATE INDEX "deferred_executions_idempotencyKey_idx" ON "deferred_executions"("idempotencyKey");

-- CreateIndex
CREATE INDEX "execution_attempts_deferredExecutionId_idx" ON "execution_attempts"("deferredExecutionId");

-- CreateIndex
CREATE INDEX "execution_attempts_organizationId_idx" ON "execution_attempts"("organizationId");

-- CreateIndex
CREATE INDEX "execution_attempts_status_idx" ON "execution_attempts"("status");

-- AddForeignKey
ALTER TABLE "scheduled_triggers" ADD CONSTRAINT "scheduled_triggers_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_triggers" ADD CONSTRAINT "scheduled_triggers_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_executions" ADD CONSTRAINT "deferred_executions_scheduledTriggerId_fkey" FOREIGN KEY ("scheduledTriggerId") REFERENCES "scheduled_triggers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_executions" ADD CONSTRAINT "deferred_executions_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deferred_executions" ADD CONSTRAINT "deferred_executions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_attempts" ADD CONSTRAINT "execution_attempts_deferredExecutionId_fkey" FOREIGN KEY ("deferredExecutionId") REFERENCES "deferred_executions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_attempts" ADD CONSTRAINT "execution_attempts_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
