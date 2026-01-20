import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { CronValidationModule } from "../cron-validation/cron-validation.module";
import { SchedulerService } from "./scheduler.service";

/**
 * Scheduler Module
 *
 * Provides background polling service for scheduled triggers.
 * Stage 6 Gate 3
 */
@Module({
  imports: [PrismaModule, CronValidationModule],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
