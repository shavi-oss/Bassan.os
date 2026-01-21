import { Test, TestingModule } from "@nestjs/testing";
import { ExecutorService } from "../../src/modules/executor/executor.service";
import { PrismaService } from "../../src/prisma/prisma.service";
import { ClsService } from "nestjs-cls";

describe("ExecutorService", () => {
  let service: ExecutorService;

  const mockClsService = {
    get: jest.fn().mockReturnValue("test-org-id"),
    set: jest.fn(),
    run: jest.fn().mockImplementation((callback) => callback()),
  };

  const mockPrismaService = {
    client: {
      organization: {
        findMany: jest.fn(),
      },
      deferredExecution: {
        findMany: jest.fn(),
        updateMany: jest.fn(),
        fields: {
          maxRetries: 3,
        },
      },
      executionAttempt: {
        findFirst: jest.fn(),
        create: jest.fn(),
        updateMany: jest.fn(),
      },
      workflowInstance: {
        create: jest.fn(),
      },
      workflowState: {
        findFirst: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExecutorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ClsService,
          useValue: mockClsService,
        },
      ],
    }).compile();

    service = module.get<ExecutorService>(ExecutorService);

    // Reset all mocks before each test
    jest.clearAllMocks();

    // Default: mock organization.findMany to return one org for processing
    mockPrismaService.client.organization.findMany.mockResolvedValue([
      { id: "org-1" },
    ]);
  });

  describe("processDueExecutions", () => {
    it("should execute valid deferred execution and create workflow instance", async () => {
      const mockExecution = {
        id: "execution-1",
        organizationId: "org-1",
        workflowDefinitionId: "workflow-1",
        idempotencyKey: "key-1",
        status: "PENDING",
        scheduledFor: new Date(),
        retryCount: 0,
        maxRetries: 3,
        payload: { test: "data" },
      };

      const mockStartState = {
        id: "state-1",
        isStart: true,
      };

      const mockWorkflowInstance = {
        id: "instance-1",
        organizationId: "org-1",
        workflowDefinitionId: "workflow-1",
        currentStateId: "state-1",
        status: "RUNNING",
      };

      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue([
        mockExecution,
      ]);
      mockPrismaService.client.executionAttempt.findFirst.mockResolvedValue(
        null,
      );
      mockPrismaService.client.deferredExecution.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.client.executionAttempt.create.mockResolvedValue({
        id: "attempt-1",
        organizationId: "org-1",
      });
      mockPrismaService.client.workflowState.findFirst.mockResolvedValue(
        mockStartState,
      );
      mockPrismaService.client.workflowInstance.create.mockResolvedValue(
        mockWorkflowInstance,
      );

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(1);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(0);

      expect(
        mockPrismaService.client.workflowInstance.create,
      ).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: "org-1",
          workflowDefinitionId: "workflow-1",
          currentStateId: "state-1",
          status: "RUNNING",
          context: { test: "data" },
        }),
      });

      expect(
        mockPrismaService.client.executionAttempt.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "attempt-1",
          organizationId: "org-1",
        },
        data: expect.objectContaining({
          status: "SUCCEEDED",
          workflowInstanceId: "instance-1",
        }),
      });

      expect(
        mockPrismaService.client.deferredExecution.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "execution-1",
          organizationId: "org-1",
        },
        data: {
          status: "COMPLETED",
        },
      });
    });

    it("should skip execution if already successfully executed (idempotency)", async () => {
      const mockExecution = {
        id: "execution-2",
        organizationId: "org-2",
        workflowDefinitionId: "workflow-2",
        idempotencyKey: "key-2",
        status: "PENDING",
        scheduledFor: new Date(),
        retryCount: 0,
        maxRetries: 3,
      };

      const mockExistingAttempt = {
        id: "attempt-2",
        status: "SUCCEEDED",
      };

      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue([
        mockExecution,
      ]);
      mockPrismaService.client.executionAttempt.findFirst.mockResolvedValue(
        mockExistingAttempt,
      );

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(1);

      expect(
        mockPrismaService.client.workflowInstance.create,
      ).not.toHaveBeenCalled();
    });

    it("should mark execution as DEAD_LETTER when max retries exceeded", async () => {
      const mockExecution = {
        id: "execution-3",
        organizationId: "org-3",
        workflowDefinitionId: "workflow-3",
        idempotencyKey: "key-3",
        status: "PENDING",
        scheduledFor: new Date(),
        retryCount: 3,
        maxRetries: 3,
      };

      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue([
        mockExecution,
      ]);
      mockPrismaService.client.executionAttempt.findFirst.mockResolvedValue(
        null,
      );
      mockPrismaService.client.deferredExecution.updateMany.mockResolvedValue({
        count: 1,
      });

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(1);

      expect(
        mockPrismaService.client.deferredExecution.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "execution-3",
          organizationId: "org-3",
        },
        data: {
          status: "DEAD_LETTER",
          lastAttemptAt: expect.any(Date),
        },
      });

      expect(
        mockPrismaService.client.workflowInstance.create,
      ).not.toHaveBeenCalled();
    });

    it("should handle workflow instance creation failure and increment retry count", async () => {
      const mockExecution = {
        id: "execution-4",
        organizationId: "org-4",
        workflowDefinitionId: "workflow-4",
        idempotencyKey: "key-4",
        status: "PENDING",
        scheduledFor: new Date(),
        retryCount: 0,
        maxRetries: 3,
      };

      const mockStartState = {
        id: "state-4",
        isStart: true,
      };

      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue([
        mockExecution,
      ]);
      mockPrismaService.client.executionAttempt.findFirst.mockResolvedValue(
        null,
      );
      mockPrismaService.client.deferredExecution.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.client.executionAttempt.create.mockResolvedValue({
        id: "attempt-4",
        organizationId: "org-4",
      });
      mockPrismaService.client.workflowState.findFirst.mockResolvedValue(
        mockStartState,
      );
      mockPrismaService.client.workflowInstance.create.mockRejectedValue(
        new Error("DB error"),
      );

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(0);
      expect(result.failed).toBe(1);

      expect(
        mockPrismaService.client.executionAttempt.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "attempt-4",
          organizationId: "org-4",
        },
        data: expect.objectContaining({
          status: "FAILED",
          errorMessage: "DB error",
        }),
      });

      expect(
        mockPrismaService.client.deferredExecution.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "execution-4",
          organizationId: "org-4",
        },
        data: {
          status: "FAILED",
          retryCount: 1,
        },
      });
    });

    it("should return zero executed when no due executions", async () => {
      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue([]);

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.skipped).toBe(0);
    });

    it("should process multiple valid executions", async () => {
      const mockExecutions = [
        {
          id: "execution-5",
          organizationId: "org-5",
          workflowDefinitionId: "workflow-5",
          idempotencyKey: "key-5",
          status: "PENDING",
          scheduledFor: new Date(),
          retryCount: 0,
          maxRetries: 3,
          payload: null,
        },
        {
          id: "execution-6",
          organizationId: "org-6",
          workflowDefinitionId: "workflow-6",
          idempotencyKey: "key-6",
          status: "PENDING",
          scheduledFor: new Date(),
          retryCount: 0,
          maxRetries: 3,
          payload: null,
        },
      ];

      const mockStartState = {
        id: "state-5",
        isStart: true,
      };

      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue(
        mockExecutions,
      );
      mockPrismaService.client.executionAttempt.findFirst.mockResolvedValue(
        null,
      );
      mockPrismaService.client.deferredExecution.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.client.executionAttempt.create.mockResolvedValue({
        id: "attempt-5",
        organizationId: "org-5",
      });
      mockPrismaService.client.workflowState.findFirst.mockResolvedValue(
        mockStartState,
      );
      mockPrismaService.client.workflowInstance.create.mockResolvedValue({
        id: "instance-5",
      });

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(2);
      expect(result.failed).toBe(0);

      expect(
        mockPrismaService.client.workflowInstance.create,
      ).toHaveBeenCalledTimes(2);
    });

    it("should throw error when no start state found for workflow", async () => {
      const mockExecution = {
        id: "execution-7",
        organizationId: "org-7",
        workflowDefinitionId: "workflow-7",
        idempotencyKey: "key-7",
        status: "PENDING",
        scheduledFor: new Date(),
        retryCount: 0,
        maxRetries: 3,
      };

      mockPrismaService.client.deferredExecution.findMany.mockResolvedValue([
        mockExecution,
      ]);
      mockPrismaService.client.executionAttempt.findFirst.mockResolvedValue(
        null,
      );
      mockPrismaService.client.deferredExecution.updateMany.mockResolvedValue({
        count: 1,
      });
      mockPrismaService.client.executionAttempt.create.mockResolvedValue({
        id: "attempt-7",
        organizationId: "org-7",
      });
      mockPrismaService.client.workflowState.findFirst.mockResolvedValue(null);

      const result = await service.processDueExecutions();

      expect(result.executed).toBe(0);
      expect(result.failed).toBe(1);

      expect(
        mockPrismaService.client.executionAttempt.updateMany,
      ).toHaveBeenCalledWith({
        where: {
          id: "attempt-7",
          organizationId: "org-7",
        },
        data: expect.objectContaining({
          status: "FAILED",
          errorMessage: expect.stringContaining("No start state found"),
        }),
      });
    });
  });
});
