import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkflowEngineService } from "./workflow-engine.service";
import { InitiateWorkflowDto } from "./dto/initiate-workflow.dto";
import { TransitionWorkflowDto } from "./dto/transition-workflow.dto";

/**
 * WorkflowInstancesService
 *
 * Orchestrates workflow runtime operations.
 * All database access via prismaService.client (tenant-scoped).
 */
@Injectable()
export class WorkflowInstancesService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workflowEngine: WorkflowEngineService,
  ) {}

  /**
   * POST /workflow-instances
   * Start a new workflow instance from ACTIVE definition
   */
  async create(
    dto: InitiateWorkflowDto,
    userId: string,
    organizationId: string,
  ) {
    // Validate definition and get start state
    const { definition, startState } =
      await this.workflowEngine.validateDefinitionForStart(
        dto.workflowDefinitionId,
        organizationId,
      );

    // Create instance in transaction
    return this.prismaService.client.$transaction(async (tx) => {
      // Create instance at start state
      const instance = await tx.workflowInstance.create({
        data: {
          workflowDefinitionId: definition.id,
          currentStateId: startState.id,
          // PR-101/B1: If start state is a terminal state, mark as COMPLETED immediately.
          // Otherwise, instance begins execution in RUNNING.
          status: startState.isEnd ? "COMPLETED" : "RUNNING",
          context: dto.context || null,
          version: 1,
          organizationId,
        },
        include: {
          workflowDefinition: true,
          currentState: true,
        },
      });

      // Log creation (fromStateId = null for initial creation)
      await tx.workflowExecutionLog.create({
        data: {
          workflowInstanceId: instance.id,
          fromStateId: null,
          toStateId: startState.id,
          triggeredById: userId,
          organizationId,
        },
      });

      return instance;
    });
  }

  /**
   * GET /workflow-instances/:id
   * Get instance status (tenant-scoped, returns 404 for cross-tenant)
   */
  async findOne(id: string, organizationId: string) {
    const instance = await this.prismaService.client.workflowInstance.findFirst(
      {
        where: {
          id,
          organizationId,
        },
        include: {
          workflowDefinition: true,
          currentState: true,
        },
      },
    );

    if (!instance) {
      throw new NotFoundException("Workflow instance not found");
    }

    return instance;
  }

  /**
   * POST /workflow-instances/:id/transition
   * Move to next state (atomic transaction with optimistic locking)
   */
  async transition(
    id: string,
    dto: TransitionWorkflowDto,
    userId: string,
    organizationId: string,
  ) {
    // Validate transition
    const { instance, targetState } =
      await this.workflowEngine.validateTransition(
        id,
        dto.transitionId,
        organizationId,
      );

    // Execute transition atomically
    return this.workflowEngine.executeTransition(
      id,
      dto.transitionId,
      instance.currentStateId, // fromStateId
      targetState.id,
      targetState.isEnd,
      instance.version,
      userId,
      organizationId,
    );
  }

  /**
   * GET /workflow-instances/:id/history
   * Get execution log (immutable history, ordered ascending)
   */
  async getHistory(id: string, organizationId: string) {
    // Verify instance exists and belongs to tenant
    const instance = await this.prismaService.client.workflowInstance.findFirst(
      {
        where: {
          id,
          organizationId,
        },
      },
    );

    if (!instance) {
      throw new NotFoundException("Workflow instance not found");
    }

    // Return execution logs ordered by timestamp
    return this.prismaService.client.workflowExecutionLog.findMany({
      where: {
        workflowInstanceId: id,
        organizationId,
      },
      include: {
        fromState: true,
        toState: true,
        triggeredBy: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });
  }
}
