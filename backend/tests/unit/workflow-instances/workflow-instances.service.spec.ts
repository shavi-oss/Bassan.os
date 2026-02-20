import { Test, TestingModule } from "@nestjs/testing";
import { WorkflowInstancesService } from "../../../src/modules/workflow-instances/workflow-instances.service";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { WorkflowEngineService } from "../../../src/modules/workflow-instances/workflow-engine.service";

/**
 * Unit tests for WorkflowInstancesService.create()
 *
 * B1 fix: workflow instance status must be COMPLETED (not RUNNING)
 * when the start state isEnd === true.
 */
describe("WorkflowInstancesService", () => {
  let module: TestingModule;
  let service: WorkflowInstancesService;

  const mockTx = {
    workflowInstance: {
      create: jest.fn(),
    },
    workflowExecutionLog: {
      create: jest.fn(),
    },
  };

  const mockPrismaService = {
    client: {
      $transaction: jest.fn(async (fn: (tx: typeof mockTx) => Promise<unknown>) =>
        fn(mockTx)
      ),
    },
  };

  const mockWorkflowEngine = {
    validateDefinitionForStart: jest.fn(),
    validateTransition: jest.fn(),
    executeTransition: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      providers: [
        WorkflowInstancesService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: WorkflowEngineService, useValue: mockWorkflowEngine },
      ],
    }).compile();

    service = module.get<WorkflowInstancesService>(WorkflowInstancesService);
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await module.close();
  });

  describe("create()", () => {
    it("should set status RUNNING when startState.isEnd is false", async () => {
      mockWorkflowEngine.validateDefinitionForStart.mockResolvedValue({
        definition: { id: "def-1" },
        startState: { id: "state-start", isEnd: false },
      });
      mockTx.workflowInstance.create.mockResolvedValue({
        id: "inst-1",
        status: "RUNNING",
      });
      mockTx.workflowExecutionLog.create.mockResolvedValue({});

      await service.create(
        { workflowDefinitionId: "def-1", context: null },
        "user-1",
        "org-1",
      );

      expect(mockTx.workflowInstance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "RUNNING" }),
        }),
      );
    });

    it("should_mark_completed_when_startState_is_end", async () => {
      // Arrange: start state is also a terminal (end) state
      mockWorkflowEngine.validateDefinitionForStart.mockResolvedValue({
        definition: { id: "def-terminal" },
        startState: { id: "state-terminal", isEnd: true },
      });
      mockTx.workflowInstance.create.mockResolvedValue({
        id: "inst-terminal",
        status: "COMPLETED",
      });
      mockTx.workflowExecutionLog.create.mockResolvedValue({});

      // Act
      await service.create(
        { workflowDefinitionId: "def-terminal", context: null },
        "user-1",
        "org-1",
      );

      // Assert: status must be COMPLETED, not RUNNING (B1 invariant)
      expect(mockTx.workflowInstance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: "COMPLETED" }),
        }),
      );
    });

    it("should include execution log with null fromStateId on start", async () => {
      mockWorkflowEngine.validateDefinitionForStart.mockResolvedValue({
        definition: { id: "def-2" },
        startState: { id: "state-2", isEnd: false },
      });
      mockTx.workflowInstance.create.mockResolvedValue({ id: "inst-2", status: "RUNNING" });
      mockTx.workflowExecutionLog.create.mockResolvedValue({});

      await service.create(
        { workflowDefinitionId: "def-2", context: null },
        "user-2",
        "org-2",
      );

      expect(mockTx.workflowExecutionLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fromStateId: null,
            toStateId: "state-2",
            triggeredById: "user-2",
          }),
        }),
      );
    });
  });
});
