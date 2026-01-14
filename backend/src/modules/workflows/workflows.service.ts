import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkflowValidationService } from "./workflow-validation.service";
import { CreateWorkflowDto } from "./dto/create-workflow.dto";
import { UpdateWorkflowDto } from "./dto/update-workflow.dto";
import { CreateStateDto } from "./dto/create-state.dto";
import { UpdateStateDto } from "./dto/update-state.dto";
import { CreateTransitionDto } from "./dto/create-transition.dto";
import { WorkflowStatus } from "@prisma/client";

/**
 * WorkflowsService
 *
 * SECURITY: All operations use prisma.client (tenant-scoped).
 * organizationId comes from CLS context set by TenantGuard.
 *
 * BUSINESS LAWS:
 * - ACTIVE workflows are IMMUTABLE
 * - ARCHIVED workflows are READ-ONLY
 * - Mutations ONLY in DRAFT
 * - Activation uses TRANSACTION LAW (single boundary)
 */
@Injectable()
export class WorkflowsService {
  constructor(
    private prisma: PrismaService,
    private validationService: WorkflowValidationService,
  ) {}

  // ============================================================
  // WORKFLOW DEFINITION CRUD
  // ============================================================

  async create(dto: CreateWorkflowDto) {
    const workflow = await this.prisma.client.workflowDefinition.create({
      data: {
        name: dto.name,
        description: dto.description,
        status: WorkflowStatus.DRAFT,
      },
    });

    return workflow;
  }

  async findAll() {
    const workflows = await this.prisma.client.workflowDefinition.findMany({
      include: {
        _count: {
          select: { states: true, transitions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return workflows;
  }

  async findOne(id: string) {
    const workflow = await this.prisma.client.workflowDefinition.findUnique({
      where: { id },
      include: {
        states: true,
        transitions: {
          include: {
            fromState: { select: { id: true, name: true } },
            toState: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!workflow) {
      throw new NotFoundException("Workflow not found");
    }

    return workflow;
  }

  async update(id: string, dto: UpdateWorkflowDto) {
    const workflow = await this.findOne(id);

    // BUSINESS LAW: Only DRAFT can be edited
    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot update ${workflow.status} workflow. Only DRAFT workflows can be edited.`,
      );
    }

    const updated = await this.prisma.client.workflowDefinition.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    return updated;
  }

  // ============================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================

  /**
   * Activate workflow
   *
   * ACTIVATION TRANSACTION LAW:
   * 1. Re-fetch definition + states + transitions
   * 2. Run validation (pure domain service)
   * 3. If valid → update status to ACTIVE
   * 4. If invalid → throw and DO NOT update
   *
   * Single transaction boundary - no partial activation.
   */
  async activate(id: string) {
    return await this.prisma.client.$transaction(async (tx) => {
      // Step 1: Re-fetch within transaction
      const workflow = await tx.workflowDefinition.findUnique({
        where: { id },
        include: {
          states: true,
          transitions: true,
        },
      });

      if (!workflow) {
        throw new NotFoundException("Workflow not found");
      }

      if (workflow.status !== WorkflowStatus.DRAFT) {
        throw new BadRequestException(
          `Workflow is already ${workflow.status}. Only DRAFT workflows can be activated.`,
        );
      }

      // Step 2: Run validation (pure domain service)
      const validationResult = this.validationService.validate(
        workflow,
        workflow.states,
        workflow.transitions,
      );

      // Step 3: If invalid → throw (transaction rolls back)
      if (!validationResult.valid) {
        throw new BadRequestException({
          message: "Workflow validation failed",
          errors: validationResult.errors,
        });
      }

      // Step 4: If valid → update status to ACTIVE
      const activated = await tx.workflowDefinition.update({
        where: { id },
        data: { status: WorkflowStatus.ACTIVE },
      });

      return activated;
    });
  }

  async archive(id: string) {
    const workflow = await this.findOne(id);

    if (workflow.status === WorkflowStatus.ARCHIVED) {
      throw new BadRequestException("Workflow is already archived");
    }

    const archived = await this.prisma.client.workflowDefinition.update({
      where: { id },
      data: { status: WorkflowStatus.ARCHIVED },
    });

    return archived;
  }

  // ============================================================
  // STATES MANAGEMENT
  // ============================================================

  async createState(workflowId: string, dto: CreateStateDto) {
    const workflow = await this.findOne(workflowId);

    // BUSINESS LAW: Only DRAFT can be edited
    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot add states to ${workflow.status} workflow. Only DRAFT workflows can be edited.`,
      );
    }

    const state = await this.prisma.client.workflowState.create({
      data: {
        workflowDefinitionId: workflowId,
        name: dto.name,
        description: dto.description,
        isStart: dto.isStart || false,
        isEnd: dto.isEnd || false,
      },
    });

    return state;
  }

  async getStates(workflowId: string) {
    // Verify workflow exists and user has access
    await this.findOne(workflowId);

    const states = await this.prisma.client.workflowState.findMany({
      where: { workflowDefinitionId: workflowId },
      orderBy: { createdAt: "asc" },
    });

    return states;
  }

  async updateState(workflowId: string, stateId: string, dto: UpdateStateDto) {
    const workflow = await this.findOne(workflowId);

    // BUSINESS LAW: Only DRAFT can be edited
    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot update states in ${workflow.status} workflow. Only DRAFT workflows can be edited.`,
      );
    }

    const state = await this.prisma.client.workflowState.findFirst({
      where: {
        id: stateId,
        workflowDefinitionId: workflowId,
      },
    });

    if (!state) {
      throw new NotFoundException("State not found");
    }

    const updated = await this.prisma.client.workflowState.update({
      where: { id: stateId },
      data: {
        name: dto.name,
        description: dto.description,
        isStart: dto.isStart,
        isEnd: dto.isEnd,
      },
    });

    return updated;
  }

  async deleteState(workflowId: string, stateId: string) {
    const workflow = await this.findOne(workflowId);

    // BUSINESS LAW: Only DRAFT can be edited
    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot delete states from ${workflow.status} workflow. Only DRAFT workflows can be edited.`,
      );
    }

    const state = await this.prisma.client.workflowState.findFirst({
      where: {
        id: stateId,
        workflowDefinitionId: workflowId,
      },
    });

    if (!state) {
      throw new NotFoundException("State not found");
    }

    await this.prisma.client.workflowState.delete({
      where: { id: stateId },
    });

    return { message: "State deleted successfully" };
  }

  // ============================================================
  // TRANSITIONS MANAGEMENT
  // ============================================================

  async createTransition(workflowId: string, dto: CreateTransitionDto) {
    const workflow = await this.findOne(workflowId);

    // BUSINESS LAW: Only DRAFT can be edited
    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot add transitions to ${workflow.status} workflow. Only DRAFT workflows can be edited.`,
      );
    }

    // Verify both states belong to this workflow
    const [fromState, toState] = await Promise.all([
      this.prisma.client.workflowState.findFirst({
        where: { id: dto.fromStateId, workflowDefinitionId: workflowId },
      }),
      this.prisma.client.workflowState.findFirst({
        where: { id: dto.toStateId, workflowDefinitionId: workflowId },
      }),
    ]);

    if (!fromState || !toState) {
      throw new BadRequestException("Both states must belong to this workflow");
    }

    const transition = await this.prisma.client.workflowTransition.create({
      data: {
        workflowDefinitionId: workflowId,
        fromStateId: dto.fromStateId,
        toStateId: dto.toStateId,
        label: dto.label,
      },
    });

    return transition;
  }

  async getTransitions(workflowId: string) {
    // Verify workflow exists and user has access
    await this.findOne(workflowId);

    const transitions = await this.prisma.client.workflowTransition.findMany({
      where: { workflowDefinitionId: workflowId },
      include: {
        fromState: { select: { id: true, name: true } },
        toState: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return transitions;
  }

  async deleteTransition(workflowId: string, transitionId: string) {
    const workflow = await this.findOne(workflowId);

    // BUSINESS LAW: Only DRAFT can be edited
    if (workflow.status !== WorkflowStatus.DRAFT) {
      throw new ForbiddenException(
        `Cannot delete transitions from ${workflow.status} workflow. Only DRAFT workflows can be edited.`,
      );
    }

    const transition = await this.prisma.client.workflowTransition.findFirst({
      where: {
        id: transitionId,
        workflowDefinitionId: workflowId,
      },
    });

    if (!transition) {
      throw new NotFoundException("Transition not found");
    }

    await this.prisma.client.workflowTransition.delete({
      where: { id: transitionId },
    });

    return { message: "Transition deleted successfully" };
  }
}
