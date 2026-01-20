import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CronValidationService } from "../cron-validation/cron-validation.service";
import { ClsService } from "nestjs-cls";

/**
 * Scheduler Service
 *
 * Background polling service that:
 * - Polls ScheduledTriggers for due executions
 * - Validates cron expressions using CronValidationService (FAIL-CLOSED)
 * - Creates DeferredExecution records with tenant isolation
 * - Updates ScheduledTrigger metadata
 *
 * Stage 6 Gate 3
 */

interface ProcessingResult {
  processed: number;
  errors: number;
  skipped: number;
}

@Injectable()
export class SchedulerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SchedulerService.name);
  private pollingInterval: NodeJS.Timeout | null = null;
  private isShuttingDown = false;
  private readonly pollIntervalMs: number;
  private readonly batchSize = 100;

  constructor(
    private readonly prisma: PrismaService,
    private readonly cronValidation: CronValidationService,
    private readonly clsService: ClsService,
  ) {
    // Read and validate SCHEDULER_POLL_INTERVAL_MS from env
    const envInterval = process.env.SCHEDULER_POLL_INTERVAL_MS;
    const parsedInterval = envInterval ? parseInt(envInterval, 10) : 10000;

    // Validate range: min 1000ms, max 60000ms
    if (parsedInterval < 1000 || parsedInterval > 60000) {
      this.logger.warn(
        `Invalid SCHEDULER_POLL_INTERVAL_MS: ${parsedInterval}. Using default 10000ms.`,
      );
      this.pollIntervalMs = 10000;
    } else {
      this.pollIntervalMs = parsedInterval;
    }
  }

  onModuleInit() {
    this.logger.log(
      `Scheduler starting with poll interval: ${this.pollIntervalMs}ms`,
    );
    this.startPolling();
  }

  onModuleDestroy() {
    this.logger.log("Scheduler shutting down...");
    this.stopPolling();
  }

  private startPolling() {
    this.pollingInterval = setInterval(() => {
      this.processDueTriggers().catch((error) => {
        this.logger.error("Error in polling cycle", error.stack);
      });
    }, this.pollIntervalMs);
  }

  private stopPolling() {
    this.isShuttingDown = true;
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  /**
   * Process due scheduled triggers
   *
   * @returns Processing result summary
   */
  async processDueTriggers(): Promise<ProcessingResult> {
    if (this.isShuttingDown) {
      return { processed: 0, errors: 0, skipped: 0 };
    }

    const result: ProcessingResult = { processed: 0, errors: 0, skipped: 0 };

    try {
      // Fetch all organizations (GLOBAL_MODEL, no CLS context required)
      const organizations = await this.prisma.client.organization.findMany({
        select: { id: true },
      });

      this.logger.debug(
        `Processing scheduled triggers for ${organizations.length} organizations`,
      );

      // Process each organization's triggers within its CLS context
      for (const org of organizations) {
        try {
          await this.clsService.run(async () => {
            // Set CLS context for tenant isolation
            this.clsService.set("orgId", org.id);
            this.clsService.set("userId", "system-worker");

            // Query due triggers for this organization (tenant-scoped)
            const dueTriggers =
              await this.prisma.client.scheduledTrigger.findMany({
                where: {
                  isActive: true,
                  nextExecutionAt: {
                    lte: new Date(),
                  },
                },
                take: this.batchSize,
                orderBy: {
                  nextExecutionAt: "asc",
                },
              });

            this.logger.debug(
              `Found ${dueTriggers.length} due triggers for org ${org.id}`,
            );

            // Process each trigger for this organization
            for (const trigger of dueTriggers) {
              try {
                const wasProcessed = await this.processSingleTrigger(trigger);
                if (wasProcessed) {
                  result.processed++;
                } else {
                  result.skipped++;
                }
              } catch (error: any) {
                result.errors++;
                this.logger.error(
                  `Failed to process trigger ${trigger.id} (org: ${trigger.organizationId})`,
                  error.stack,
                );
              }
            }
          });
        } catch (error: any) {
          // Log per-organization errors but continue processing other orgs
          this.logger.error(
            `Error processing triggers for org ${org.id}`,
            error.stack,
          );
        }
      }

      if (result.processed > 0 || result.errors > 0) {
        this.logger.log(
          `Polling cycle complete: processed=${result.processed}, errors=${result.errors}, skipped=${result.skipped}`,
        );
      }
    } catch (error: any) {
      this.logger.error("Error in processDueTriggers", error.stack);
    }

    return result;
  }

  private async processSingleTrigger(trigger: any): Promise<boolean> {
    const {
      id,
      organizationId,
      cronExpression,
      timezone,
      workflowDefinitionId,
    } = trigger;

    // FAIL-CLOSED validation: cron expression
    if (cronExpression) {
      const cronValidationResult =
        this.cronValidation.validateCronExpression(cronExpression);
      if (!cronValidationResult.valid) {
        this.logger.warn({
          triggerId: id,
          organizationId,
          outcome: "failure",
          errorMessage: `Invalid cron expression: ${cronValidationResult.error}`,
        });
        return false; // Skip this trigger
      }
    }

    // FAIL-CLOSED validation: timezone (if provided)
    if (timezone) {
      const tzValidationResult = this.cronValidation.validateTimezone(timezone);
      if (!tzValidationResult.valid) {
        this.logger.warn({
          triggerId: id,
          organizationId,
          outcome: "failure",
          errorMessage: `Invalid timezone: ${tzValidationResult.error}`,
        });
        return false; // Skip this trigger
      }
    }

    // Calculate next execution time
    let nextExecutionAt: Date;
    try {
      if (cronExpression) {
        nextExecutionAt = this.cronValidation.calculateNextExecution(
          cronExpression,
          timezone || "UTC",
          new Date(),
        );
      } else {
        // delaySeconds-based trigger (one-time execution)
        nextExecutionAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // Far future
      }
    } catch (error: any) {
      this.logger.warn({
        triggerId: id,
        organizationId,
        outcome: "failure",
        errorMessage: `Failed to calculate next execution: ${error.message}`,
      });
      return false; // Skip this trigger
    }

    // Create DeferredExecution with deterministic idempotencyKey
    const executionTimestamp = new Date().toISOString();
    const idempotencyKey = `scheduled-trigger-${id}-${executionTimestamp}`;

    try {
      // Create deferred execution WITH organizationId filter for tenant safety
      await this.prisma.client.deferredExecution.create({
        data: {
          organizationId,
          workflowDefinitionId,
          idempotencyKey,
          scheduledFor: new Date(),
          status: "PENDING",
        },
      });

      // Update trigger metadata WITH organizationId filter
      await this.prisma.client.scheduledTrigger.updateMany({
        where: {
          id,
          organizationId, // Explicit tenant filter
        },
        data: {
          lastExecutedAt: new Date(),
          nextExecutionAt,
        },
      });

      this.logger.debug({
        triggerId: id,
        organizationId,
        outcome: "success",
        idempotencyKey,
        nextExecutionAt: nextExecutionAt.toISOString(),
      });
    } catch (error: any) {
      // Log error but don't throw - continue processing other triggers
      this.logger.error({
        triggerId: id,
        organizationId,
        outcome: "failure",
        errorMessage: `Failed to create deferred execution: ${error.message}`,
      });
      throw error; // Re-throw to increment error counter
    }

    return true; // Successfully processed
  }
}
