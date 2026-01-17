import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { WorkflowStatus } from "@prisma/client";

/**
 * WorkflowEngineService
 *
 * The Brain - Enforces Stage 2 workflow definition constraints at runtime.
 *
 * Rules:
 * - Only ACTIVE definitions can be instantiated
 * - Transitions must exist in definition graph
 * - Transitions only allowed from RUNNING instances
 * - State changes are atomic (transaction)
 * - Optimistic locking via version field
 */
@Injectable()
export class WorkflowEngineService {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Validate that a workflow definition is ACTIVE and has a start state
   */
  async validateDefinitionForStart(
    workflowDefinitionId: string,
    organizationId: string,
  ) {
    const definition =
      await this.prismaService.client.workflowDefinition.findFirst({
        where: {
          id: workflowDefinitionId,
          organizationId,
        },
        include: {
          states: {
            where: { isStart: true },
          },
        },
      });

    if (!definition) {
      throw new NotFoundException("Workflow definition not found");
    }

    if (definition.status !== WorkflowStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot start workflow from ${definition.status} definition. Only ACTIVE workflows can be started.`,
      );
    }

    const startState = definition.states.find((s) => s.isStart);
    if (!startState) {
      throw new BadRequestException(
        "Workflow definition has no start state. Cannot instantiate.",
      );
    }

    return { definition, startState };
  }

  /**
   * Validate that a transition exists and is valid for the current state
   */
  async validateTransition(
    instanceId: string,
    transitionId: string,
    organizationId: string,
  ) {
    // Get instance with current state
    const instance = await this.prismaService.client.workflowInstance.findFirst(
      {
        where: {
          id: instanceId,
          organizationId,
        },
        include: {
          workflowDefinition: {
            include: {
              transitions: true,
              states: true,
            },
          },
        },
      },
    );

    if (!instance) {
      throw new NotFoundException("Workflow instance not found");
    }

    if (instance.status !== "RUNNING") {
      throw new BadRequestException(
        `Cannot transition workflow in ${instance.status} state. Only RUNNING workflows can transition.`,
      );
    }

    // Find the requested transition
    const transition = instance.workflowDefinition.transitions.find(
      (t) => t.id === transitionId,
    );

    if (!transition) {
      throw new BadRequestException(
        "Transition not found in workflow definition",
      );
    }

    // Verify transition is valid from current state
    if (transition.fromStateId !== instance.currentStateId) {
      throw new BadRequestException(
        `Invalid transition. Current state is ${instance.currentStateId}, but transition requires ${transition.fromStateId}`,
      );
    }

    // Get target state
    const targetState = instance.workflowDefinition.states.find(
      (s) => s.id === transition.toStateId,
    );

    if (!targetState) {
      throw new BadRequestException("Target state not found");
    }

    return { instance, transition, targetState };
  }

  /**
   * Execute a state transition atomically
   *
   * Transaction includes:
   * - Update instance currentStateId
   * - Increment version (optimistic locking)
   * - Set status to COMPLETED if target state is end state
   * - Append execution log entry
   */
  async executeTransition(
    instanceId: string,
    transitionId: string,
    fromStateId: string,
    targetStateId: string,
    isEndState: boolean,
    currentVersion: number,
    userId: string,
    organizationId: string,
  ) {
    return this.prismaService.client.$transaction(async (tx) => {
      // Update instance with optimistic locking check
      const updatedInstance = await tx.workflowInstance.updateMany({
        where: {
          id: instanceId,
          version: currentVersion,
          organizationId,
        },
        data: {
          currentStateId: targetStateId,
          version: currentVersion + 1,
          status: isEndState ? "COMPLETED" : "RUNNING",
          updatedAt: new Date(),
        },
      });

      if (updatedInstance.count === 0) {
        throw new BadRequestException(
          "Workflow instance was modified by another process. Please retry.",
        );
      }

      // Append execution log (immutable)
      await tx.workflowExecutionLog.create({
        data: {
          workflowInstanceId: instanceId,
          fromStateId: fromStateId,
          toStateId: targetStateId,
          triggeredById: userId,
          organizationId,
        },
      });

      // Return updated instance
      return tx.workflowInstance.findUnique({
        where: { id: instanceId },
        include: {
          workflowDefinition: true,
          currentState: true,
        },
      });
    });
  }
}
