import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/**
 * Executor Service
 *
 * Pure background service that:
 * - Reads due DeferredExecution records (tenant-scoped)
 * - Executes workflow instances safely (NO direct workflow logic)
 * - Enforces idempotency (idempotencyKey is source of truth)
 * - Marks execution outcome: SUCCESS or FAILED (with reason)
 * - NEVER swallows errors silently
 * - NEVER throws unhandled exceptions
 *
 * Stage 6 Gate 4
 */

interface ExecutionResult {
  executed: number;
  failed: number;
  skipped: number;
}

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name);
  private readonly batchSize = 50;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Process due deferred executions
   *
   * @returns Execution result summary
   */
  async processDueExecutions(): Promise<ExecutionResult> {
    const result: ExecutionResult = { executed: 0, failed: 0, skipped: 0 };

    try {
      // Query due executions (batch limit)
      // Using tenant-scoped client - processes all organizations' executions
      // via CLS context (each execution processed with its organizationId)
      const dueExecutions = await this.prisma.client.deferredExecution.findMany(
        {
          where: {
            status: "PENDING",
            scheduledFor: {
              lte: new Date(),
            },
            retryCount: {
              lt: this.prisma.client.deferredExecution.fields.maxRetries,
            },
          },
          take: this.batchSize,
          orderBy: {
            scheduledFor: "asc",
          },
        },
      );

      this.logger.debug(`Found ${dueExecutions.length} due executions`);

      for (const execution of dueExecutions) {
        try {
          const wasExecuted = await this.processSingleExecution(execution);
          if (wasExecuted) {
            result.executed++;
          } else {
            result.skipped++;
          }
        } catch (error: any) {
          result.failed++;
          this.logger.error(
            `Failed to process execution ${execution.id} (org: ${execution.organizationId})`,
            error.stack,
          );
        }
      }

      if (result.executed > 0 || result.failed > 0) {
        this.logger.log(
          `Execution cycle complete: executed=${result.executed}, failed=${result.failed}, skipped=${result.skipped}`,
        );
      }
    } catch (error: any) {
      this.logger.error("Error querying due executions", error.stack);
    }

    return result;
  }

  /**
   * Process a single deferred execution
   *
   * @param execution - The deferred execution record
   * @returns true if executed, false if skipped
   */
  private async processSingleExecution(execution: any): Promise<boolean> {
    const { id, organizationId, workflowDefinitionId, retryCount, maxRetries } =
      execution;

    // Check if already processed (idempotency check)
    const existingAttempt = await this.prisma.client.executionAttempt.findFirst(
      {
        where: {
          deferredExecutionId: id,
          status: "SUCCEEDED",
        },
      },
    );

    if (existingAttempt) {
      this.logger.debug({
        executionId: id,
        organizationId,
        outcome: "skipped",
        reason: "Already successfully executed",
      });
      return false;
    }

    // Check retry limit
    if (retryCount >= maxRetries) {
      this.logger.warn({
        executionId: id,
        organizationId,
        outcome: "skipped",
        reason: "Max retries exceeded",
      });

      // Mark as DEAD_LETTER
      await this.prisma.client.deferredExecution.updateMany({
        where: {
          id,
          organizationId, // Explicit tenant filter
        },
        data: {
          status: "DEAD_LETTER",
          lastAttemptAt: new Date(),
        },
      });

      return false;
    }

    // Mark as PROCESSING
    await this.prisma.client.deferredExecution.updateMany({
      where: {
        id,
        organizationId, // Explicit tenant filter
      },
      data: {
        status: "PROCESSING",
        lastAttemptAt: new Date(),
      },
    });

    // Create execution attempt record
    const attemptNumber = retryCount + 1;
    const attempt = await this.prisma.client.executionAttempt.create({
      data: {
        organizationId,
        deferredExecutionId: id,
        attemptNumber,
        status: "RUNNING",
      },
    });

    try {
      // Execute workflow instance creation
      // This is a PLACEHOLDER for actual workflow execution logic
      // Gate 4 does NOT implement workflow execution - only the infrastructure
      const workflowInstance = await this.prisma.client.workflowInstance.create(
        {
          data: {
            organizationId,
            workflowDefinitionId,
            currentStateId: await this.getStartStateId(workflowDefinitionId),
            status: "RUNNING",
            context: execution.payload || {},
          },
        },
      );

      // Mark attempt as SUCCEEDED
      await this.prisma.client.executionAttempt.updateMany({
        where: {
          id: attempt.id,
          organizationId, // Explicit tenant filter
        },
        data: {
          status: "SUCCEEDED",
          completedAt: new Date(),
          workflowInstanceId: workflowInstance.id,
        },
      });

      // Mark deferred execution as COMPLETED
      await this.prisma.client.deferredExecution.updateMany({
        where: {
          id,
          organizationId, // Explicit tenant filter
        },
        data: {
          status: "COMPLETED",
        },
      });

      this.logger.debug({
        executionId: id,
        organizationId,
        outcome: "success",
        workflowInstanceId: workflowInstance.id,
        attemptNumber,
      });

      return true;
    } catch (error: any) {
      // Mark attempt as FAILED
      await this.prisma.client.executionAttempt.updateMany({
        where: {
          id: attempt.id,
          organizationId, // Explicit tenant filter
        },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          errorMessage: error.message,
          errorCode: error.code || "UNKNOWN",
        },
      });

      // Increment retry count and mark as FAILED
      await this.prisma.client.deferredExecution.updateMany({
        where: {
          id,
          organizationId, // Explicit tenant filter
        },
        data: {
          status: "FAILED",
          retryCount: retryCount + 1,
        },
      });

      this.logger.error({
        executionId: id,
        organizationId,
        outcome: "failure",
        errorMessage: error.message,
        attemptNumber,
      });

      throw error; // Re-throw to increment failed counter
    }
  }

  /**
   * Get the start state ID for a workflow definition
   *
   * @param workflowDefinitionId - The workflow definition ID
   * @returns The start state ID
   */
  private async getStartStateId(workflowDefinitionId: string): Promise<string> {
    const startState = await this.prisma.client.workflowState.findFirst({
      where: {
        workflowDefinitionId,
        isStart: true,
      },
    });

    if (!startState) {
      throw new Error(
        `No start state found for workflow definition ${workflowDefinitionId}`,
      );
    }

    return startState.id;
  }
}
