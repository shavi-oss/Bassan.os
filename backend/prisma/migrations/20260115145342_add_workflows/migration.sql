-- CreateEnum
CREATE TYPE "WorkflowStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "workflow_definitions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_definitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_states" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isStart" BOOLEAN NOT NULL DEFAULT false,
    "isEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_states_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workflow_transitions" (
    "id" TEXT NOT NULL,
    "workflowDefinitionId" TEXT NOT NULL,
    "fromStateId" TEXT NOT NULL,
    "toStateId" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workflow_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "workflow_definitions_organizationId_idx" ON "workflow_definitions"("organizationId");

-- CreateIndex
CREATE INDEX "workflow_definitions_status_idx" ON "workflow_definitions"("status");

-- CreateIndex
CREATE INDEX "workflow_states_workflowDefinitionId_idx" ON "workflow_states"("workflowDefinitionId");

-- CreateIndex
CREATE INDEX "workflow_transitions_workflowDefinitionId_idx" ON "workflow_transitions"("workflowDefinitionId");

-- CreateIndex
CREATE INDEX "workflow_transitions_fromStateId_idx" ON "workflow_transitions"("fromStateId");

-- CreateIndex
CREATE INDEX "workflow_transitions_toStateId_idx" ON "workflow_transitions"("toStateId");

-- AddForeignKey
ALTER TABLE "workflow_definitions" ADD CONSTRAINT "workflow_definitions_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_states" ADD CONSTRAINT "workflow_states_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_workflowDefinitionId_fkey" FOREIGN KEY ("workflowDefinitionId") REFERENCES "workflow_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_fromStateId_fkey" FOREIGN KEY ("fromStateId") REFERENCES "workflow_states"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workflow_transitions" ADD CONSTRAINT "workflow_transitions_toStateId_fkey" FOREIGN KEY ("toStateId") REFERENCES "workflow_states"("id") ON DELETE CASCADE ON UPDATE CASCADE;
