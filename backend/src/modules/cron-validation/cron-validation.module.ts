import { Module } from "@nestjs/common";
import { CronValidationService } from "./cron-validation.service";

/**
 * Cron Validation Module
 *
 * Provides cron expression validation services.
 * Stage 6 Gate 2
 */
@Module({
  providers: [CronValidationService],
  exports: [CronValidationService],
})
export class CronValidationModule {}
