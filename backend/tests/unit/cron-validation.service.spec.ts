import { Test, TestingModule } from "@nestjs/testing";
import { CronValidationService } from "../../src/modules/cron-validation/cron-validation.service";

describe("CronValidationService", () => {
  let service: CronValidationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CronValidationService],
    }).compile();

    service = module.get<CronValidationService>(CronValidationService);
  });

  describe("validateCronExpression", () => {
    it("should validate a valid cron expression (every minute)", () => {
      const result = service.validateCronExpression("* * * * *");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate a valid cron expression (every hour)", () => {
      const result = service.validateCronExpression("0 * * * *");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate a valid cron expression (daily at midnight)", () => {
      const result = service.validateCronExpression("0 0 * * *");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate a cron expression with ranges", () => {
      const result = service.validateCronExpression("0-30 * * * *");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate a cron expression with lists", () => {
      const result = service.validateCronExpression("0,15,30,45 * * * *");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate a cron expression with steps", () => {
      const result = service.validateCronExpression("*/5 * * * *");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject a cron expression with too few fields", () => {
      const result = service.validateCronExpression("* * *");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid cron expression");
    });

    it("should reject a cron expression with invalid characters", () => {
      const result = service.validateCronExpression("invalid * * * *");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid cron expression");
    });

    it("should reject an empty string", () => {
      const result = service.validateCronExpression("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("non-empty string");
    });

    it("should reject null input", () => {
      const result = service.validateCronExpression(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("non-empty string");
    });
  });

  describe("validateTimezone", () => {
    it("should validate UTC timezone", () => {
      const result = service.validateTimezone("UTC");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate America/New_York timezone", () => {
      const result = service.validateTimezone("America/New_York");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate Europe/London timezone", () => {
      const result = service.validateTimezone("Europe/London");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should validate Asia/Tokyo timezone", () => {
      const result = service.validateTimezone("Asia/Tokyo");
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject an invalid timezone", () => {
      const result = service.validateTimezone("Invalid/Timezone");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid timezone");
    });

    it("should reject an empty string", () => {
      const result = service.validateTimezone("");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("non-empty string");
    });

    it("should reject null input", () => {
      const result = service.validateTimezone(null as any);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("non-empty string");
    });
  });

  describe("calculateNextExecution", () => {
    it("should calculate next execution for every minute cron", () => {
      const now = new Date();
      const next = service.calculateNextExecution("* * * * *", "UTC");

      expect(next).toBeInstanceOf(Date);
      expect(next.getTime()).toBeGreaterThan(now.getTime());
      // Next execution should be within 2 minutes
      expect(next.getTime() - now.getTime()).toBeLessThan(2 * 60 * 1000);
    });

    it("should calculate next execution for daily at midnight", () => {
      const next = service.calculateNextExecution("0 0 * * *", "UTC");

      expect(next).toBeInstanceOf(Date);
      expect(next.getUTCHours()).toBe(0);
      expect(next.getUTCMinutes()).toBe(0);
    });

    it("should calculate next execution with timezone", () => {
      const next = service.calculateNextExecution(
        "0 12 * * *",
        "America/New_York",
      );

      expect(next).toBeInstanceOf(Date);
      // Should be a valid future date
      expect(next.getTime()).toBeGreaterThan(Date.now());
    });

    it("should calculate next execution from specific date", () => {
      const fromDate = new Date("2024-01-01T00:00:00Z");
      const next = service.calculateNextExecution(
        "0 12 * * *",
        "UTC",
        fromDate,
      );

      expect(next).toBeInstanceOf(Date);
      expect(next.getTime()).toBeGreaterThan(fromDate.getTime());
    });

    it("should throw error for invalid cron expression", () => {
      expect(() => {
        service.calculateNextExecution("invalid", "UTC");
      }).toThrow("Invalid cron expression");
    });

    it("should throw error for invalid timezone", () => {
      expect(() => {
        service.calculateNextExecution("* * * * *", "Invalid/Timezone");
      }).toThrow("Invalid timezone");
    });

    it("should throw error for empty cron expression", () => {
      expect(() => {
        service.calculateNextExecution("", "UTC");
      }).toThrow();
    });

    it("should throw error for empty timezone", () => {
      expect(() => {
        service.calculateNextExecution("* * * * *", "");
      }).toThrow();
    });
  });
});
