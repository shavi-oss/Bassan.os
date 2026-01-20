import { Test, TestingModule } from "@nestjs/testing";
import { SchedulerService } from "../../src/modules/scheduler/scheduler.service";
import { PrismaService } from "../../src/prisma/prisma.service";
import { CronValidationService } from "../../src/modules/cron-validation/cron-validation.service";

describe("SchedulerService", () => {
  let service: SchedulerService;

  const mockPrismaService = {
    client: {
      scheduledTrigger: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
      },
      deferredExecution: {
        create: jest.fn(),
      },
    },
  };

  const mockCronValidationService = {
    validateCronExpression: jest.fn(),
    validateTimezone: jest.fn(),
    calculateNextExecution: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CronValidationService,
          useValue: mockCronValidationService,
        },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe("processDueTriggers", () => {
    it("should process valid cron trigger and create deferred execution", async () => {
      const mockTrigger = {
        id: "trigger-1",
        organizationId: "org-1",
        workflowDefinitionId: "workflow-1",
        cronExpression: "0 0 * * *",
        timezone: "UTC",
        isActive: true,
        nextExecutionAt: new Date(),
      };

      const nextExecution = new Date(Date.now() + 24 * 60 * 60 * 1000);

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.validateTimezone.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.calculateNextExecution.mockReturnValue(
        nextExecution,
      );
      mockPrismaService.client.deferredExecution.create.mockResolvedValue({});
      mockPrismaService.client.scheduledTrigger.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(1);
      expect(result.errors).toBe(0);
      expect(result.skipped).toBe(0);

      expect(
        mockCronValidationService.validateCronExpression,
      ).toHaveBeenCalledWith("0 0 * * *");
      expect(mockCronValidationService.validateTimezone).toHaveBeenCalledWith(
        "UTC",
      );
      expect(
        mockCronValidationService.calculateNextExecution,
      ).toHaveBeenCalledWith("0 0 * * *", "UTC", expect.any(Date));

      expect(
        mockPrismaService.client.deferredExecution.create,
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: "org-1",
          workflowDefinitionId: "workflow-1",
          idempotencyKey: expect.stringContaining(
            "scheduled-trigger-trigger-1",
          ),
          status: "PENDING",
        }),
      });

      expect(
        mockPrismaService.client.scheduledTrigger.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "trigger-1",
          organizationId: "org-1",
        },
        data: {
          lastExecutedAt: expect.any(Date),
          nextExecutionAt: nextExecution,
        },
      });
    });

    it("should skip trigger with invalid cron expression", async () => {
      const mockTrigger = {
        id: "trigger-2",
        organizationId: "org-2",
        workflowDefinitionId: "workflow-2",
        cronExpression: "invalid cron",
        timezone: "UTC",
        isActive: true,
        nextExecutionAt: new Date(),
      };

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: false,
        error: "Invalid cron expression",
      });

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);

      expect(
        mockPrismaService.client.deferredExecution.create,
      ).not.toHaveBeenCalled();
      expect(
        mockPrismaService.client.scheduledTrigger.updateMany,
      ).not.toHaveBeenCalled();
    });

    it("should skip trigger with invalid timezone", async () => {
      const mockTrigger = {
        id: "trigger-3",
        organizationId: "org-3",
        workflowDefinitionId: "workflow-3",
        cronExpression: "0 0 * * *",
        timezone: "Invalid/Timezone",
        isActive: true,
        nextExecutionAt: new Date(),
      };

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.validateTimezone.mockReturnValue({
        valid: false,
        error: "Invalid timezone",
      });

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);

      expect(
        mockPrismaService.client.deferredExecution.create,
      ).not.toHaveBeenCalled();
      expect(
        mockPrismaService.client.scheduledTrigger.updateMany,
      ).not.toHaveBeenCalled();
    });

    it("should skip trigger when calculateNextExecution throws", async () => {
      const mockTrigger = {
        id: "trigger-4",
        organizationId: "org-4",
        workflowDefinitionId: "workflow-4",
        cronExpression: "0 0 * * *",
        timezone: "UTC",
        isActive: true,
        nextExecutionAt: new Date(),
      };

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.validateTimezone.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.calculateNextExecution.mockImplementation(
        () => {
          throw new Error("Calculation failed");
        },
      );

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);

      expect(
        mockPrismaService.client.deferredExecution.create,
      ).not.toHaveBeenCalled();
    });

    it("should return zero processed when no due triggers", async () => {
      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([]);

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it("should process multiple valid triggers", async () => {
      const mockTriggers = [
        {
          id: "trigger-5",
          organizationId: "org-5",
          workflowDefinitionId: "workflow-5",
          cronExpression: "0 0 * * *",
          timezone: "UTC",
          isActive: true,
          nextExecutionAt: new Date(),
        },
        {
          id: "trigger-6",
          organizationId: "org-6",
          workflowDefinitionId: "workflow-6",
          cronExpression: "0 12 * * *",
          timezone: "America/New_York",
          isActive: true,
          nextExecutionAt: new Date(),
        },
      ];

      const nextExecution = new Date(Date.now() + 24 * 60 * 60 * 1000);

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue(
        mockTriggers,
      );
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.validateTimezone.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.calculateNextExecution.mockReturnValue(
        nextExecution,
      );
      mockPrismaService.client.deferredExecution.create.mockResolvedValue({});
      mockPrismaService.client.scheduledTrigger.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(2);
      expect(result.errors).toBe(0);

      expect(
        mockPrismaService.client.deferredExecution.create,
      ).toHaveBeenCalledTimes(2);
      expect(
        mockPrismaService.client.scheduledTrigger.updateMany,
      ).toHaveBeenCalledTimes(2);
    });

    it("should handle deferred execution creation failure", async () => {
      const mockTrigger = {
        id: "trigger-7",
        organizationId: "org-7",
        workflowDefinitionId: "workflow-7",
        cronExpression: "0 0 * * *",
        timezone: "UTC",
        isActive: true,
        nextExecutionAt: new Date(),
      };

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.validateTimezone.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.calculateNextExecution.mockReturnValue(
        new Date(),
      );
      mockPrismaService.client.deferredExecution.create.mockRejectedValue(
        new Error("DB error"),
      );

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(0);
      expect(result.errors).toBe(1);

      expect(
        mockPrismaService.client.scheduledTrigger.updateMany,
      ).not.toHaveBeenCalled();
    });

    it("should process trigger without timezone (default to UTC)", async () => {
      const mockTrigger = {
        id: "trigger-8",
        organizationId: "org-8",
        workflowDefinitionId: "workflow-8",
        cronExpression: "0 0 * * *",
        timezone: null,
        isActive: true,
        nextExecutionAt: new Date(),
      };

      const nextExecution = new Date(Date.now() + 24 * 60 * 60 * 1000);

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockCronValidationService.validateCronExpression.mockReturnValue({
        valid: true,
      });
      mockCronValidationService.calculateNextExecution.mockReturnValue(
        nextExecution,
      );
      mockPrismaService.client.deferredExecution.create.mockResolvedValue({});
      mockPrismaService.client.scheduledTrigger.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(1);

      expect(
        mockCronValidationService.calculateNextExecution,
      ).toHaveBeenCalledWith("0 0 * * *", "UTC", expect.any(Date));
    });

    it("should process trigger without cron expression (delaySeconds-based)", async () => {
      const mockTrigger = {
        id: "trigger-9",
        organizationId: "org-9",
        workflowDefinitionId: "workflow-9",
        cronExpression: null,
        timezone: null,
        isActive: true,
        nextExecutionAt: new Date(),
      };

      mockPrismaService.client.scheduledTrigger.findMany.mockResolvedValue([
        mockTrigger,
      ]);
      mockPrismaService.client.deferredExecution.create.mockResolvedValue({});
      mockPrismaService.client.scheduledTrigger.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.processDueTriggers();

      expect(result.processed).toBe(1);

      expect(
        mockCronValidationService.validateCronExpression,
      ).not.toHaveBeenCalled();
      expect(
        mockCronValidationService.calculateNextExecution,
      ).not.toHaveBeenCalled();
    });
  });
});
