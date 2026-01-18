import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class DeferredExecutionService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.deferredExecution.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        scheduledTrigger: {
          select: { id: true, cronExpression: true, description: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const execution = await this.prisma.client.deferredExecution.findFirst({
      where: { id },
    });

    if (!execution) {
      throw new NotFoundException(`Deferred execution with ID ${id} not found`);
    }

    return execution;
  }

  async findAttempts(id: string) {
    // Verify execution exists and is accessible
    await this.findOne(id);

    return this.prisma.client.executionAttempt.findMany({
      where: { deferredExecutionId: id },
      orderBy: { attemptNumber: "desc" },
    });
  }

  async retry(id: string) {
    const execution = await this.findOne(id);

    // Only allow retry if currently FAILED or DEAD_LETTER (or maybe just not PENDING/PROCESSING/COMPLETED logic? Plan says "Factory reset" basically)
    // Minimally lawful: if it's failed, let's retry.
    if (execution.status !== "FAILED" && execution.status !== "DEAD_LETTER") {
      throw new BadRequestException(
        `Cannot retry execution in status ${execution.status}`,
      );
    }

    // Reset to PENDING so it gets picked up again
    // We do NOT reset retryCount usually in this model if we want to track total attempts,
    // but often manual retry might reset it or we just increase maxRetries.
    // Plan says "Retry fields must be used exactly as specified."
    // Let's sets status to PENDING and scheduledFor to now.

    return this.prisma.client.deferredExecution.updateMany({
      where: { id }, // implicit orgId from extension
      data: {
        status: "PENDING",
        scheduledFor: new Date(),
        // We might want to increment maxRetries if it was exhausted?
        // For now, minimal behavior is just setting it back to pending.
        // If it was dead letter, it might need maxRetries bump or reset retryCount.
        // Let's blindly set to PENDING as requested "transition status to PENDING/PROCESSING".
      },
    });
  }
}
