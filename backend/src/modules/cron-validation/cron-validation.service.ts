import { Injectable } from "@nestjs/common";
import CronExpressionParser from "cron-parser";

/**
 * Cron Validation Service
 *
 * Pure validation logic for cron expressions and timezones.
 * NO database access, NO controllers, NO background execution.
 *
 * Stage 6 Gate 2
 */

export interface CronValidationResult {
  valid: boolean;
  error?: string;
}

@Injectable()
export class CronValidationService {
  /**
   * Validate cron expression syntax
   *
   * @param expression - Cron expression (5 or 6 field format)
   * @returns Validation result with optional error message
   */
  validateCronExpression(expression: string): CronValidationResult {
    if (!expression || typeof expression !== "string") {
      return {
        valid: false,
        error: "Cron expression must be a non-empty string",
      };
    }

    // Validate field count (must be 5 or 6 fields)
    const fields = expression.trim().split(/\s+/);
    if (fields.length < 5) {
      return {
        valid: false,
        error: "Invalid cron expression: must have at least 5 fields",
      };
    }

    try {
      // Parse cron expression to validate syntax
      CronExpressionParser.parse(expression.trim());
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: `Invalid cron expression: ${error.message}`,
      };
    }
  }

  /**
   * Validate timezone string
   *
   * @param timezone - IANA timezone database string (e.g., 'America/New_York')
   * @returns Validation result with optional error message
   */
  validateTimezone(timezone: string): CronValidationResult {
    if (!timezone || typeof timezone !== "string") {
      return {
        valid: false,
        error: "Timezone must be a non-empty string",
      };
    }

    try {
      // Attempt to create a date with the timezone
      // This will throw if timezone is invalid
      new Date().toLocaleString("en-US", { timeZone: timezone });
      return { valid: true };
    } catch (error: any) {
      return {
        valid: false,
        error: `Invalid timezone: ${timezone}`,
      };
    }
  }

  /**
   * Calculate next execution time for a cron expression
   *
   * @param expression - Valid cron expression
   * @param timezone - Valid IANA timezone string
   * @param fromDate - Optional starting date (defaults to now)
   * @returns Next execution time as Date object
   * @throws Error if expression or timezone is invalid
   */
  calculateNextExecution(
    expression: string,
    timezone: string,
    fromDate?: Date,
  ): Date {
    // Validate inputs first
    const exprValidation = this.validateCronExpression(expression);
    if (!exprValidation.valid) {
      throw new Error(exprValidation.error);
    }

    const tzValidation = this.validateTimezone(timezone);
    if (!tzValidation.valid) {
      throw new Error(tzValidation.error);
    }

    try {
      // Parse cron expression with timezone
      const interval = CronExpressionParser.parse(expression.trim(), {
        currentDate: (fromDate || new Date()) as any,
        tz: timezone.trim(),
      });

      // Get next execution time
      return interval.next().toDate();
    } catch (error: any) {
      throw new Error(`Failed to calculate next execution: ${error.message}`);
    }
  }
}
