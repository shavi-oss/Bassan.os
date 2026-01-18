import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTriggerDto } from "./dto/create-trigger.dto";
import { UpdateTriggerDto } from "./dto/update-trigger.dto";
import { FireEventDto } from "./dto/fire-event.dto";
import { WorkflowStatus } from "@prisma/client";

@Injectable()
export class WorkflowTriggersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTriggerDto, organizationId: string) {
    // Verify workflow definition exists and is ACTIVE
    const definition = await this.prisma.client.workflowDefinition.findUnique({
      where: { id: dto.workflowDefinitionId },
    });

    if (!definition) {
      throw new NotFoundException("Workflow definition not found");
    }

    if (definition.status !== WorkflowStatus.ACTIVE) {
      throw new BadRequestException(
        "Cannot create trigger for non-ACTIVE workflow definition",
      );
    }

    // Create trigger with unique constraint on (organizationId, eventKey)
    try {
      return await this.prisma.client.workflowTrigger.create({
        data: {
          eventKey: dto.eventKey,
          workflowDefinitionId: dto.workflowDefinitionId,
          description: dto.description,
          isActive: dto.isActive ?? true,
          organizationId,
        },
        include: {
          workflowDefinition: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new BadRequestException(
          `Trigger with eventKey "${dto.eventKey}" already exists for this organization`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.client.workflowTrigger.findMany({
      include: {
        workflowDefinition: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const trigger = await this.prisma.client.workflowTrigger.findUnique({
      where: { id },
      include: {
        workflowDefinition: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });

    if (!trigger) {
      throw new NotFoundException("Trigger not found");
    }

    return trigger;
  }

  async update(id: string, dto: UpdateTriggerDto) {
    // Verify trigger exists (tenant-scoped)
    const existing = await this.prisma.client.workflowTrigger.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException("Trigger not found");
    }

    // Only allow updating isActive and description (per Stage 4 laws)
    return this.prisma.client.workflowTrigger.update({
      where: { id },
      data: {
        isActive: dto.isActive,
        description: dto.description,
      },
      include: {
        workflowDefinition: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
    });
  }

  async fireEvent(dto: FireEventDto, userId: string, organizationId: string) {
    // Find trigger by eventKey (tenant-scoped)
    const trigger = await this.prisma.client.workflowTrigger.findUnique({
      where: {
        organizationId_eventKey: {
          organizationId,
          eventKey: dto.eventKey,
        },
      },
      include: {
        workflowDefinition: {
          include: {
            states: true,
          },
        },
      },
    });

    if (!trigger) {
      throw new NotFoundException(
        `No trigger found for event "${dto.eventKey}"`,
      );
    }

    if (!trigger.isActive) {
      throw new BadRequestException(
        `Trigger for event "${dto.eventKey}" is not active`,
      );
    }

    // Verify workflow definition is ACTIVE
    if (trigger.workflowDefinition.status !== WorkflowStatus.ACTIVE) {
      throw new BadRequestException(
        "Cannot fire event: workflow definition is not ACTIVE",
      );
    }

    // Find start state
    const startState = trigger.workflowDefinition.states.find((s) => s.isStart);
    if (!startState) {
      throw new BadRequestException(
        "Cannot fire event: workflow definition has no start state",
      );
    }

    // Create WorkflowInstance and WorkflowTriggerEvent in a transaction
    return this.prisma.client.$transaction(async (tx) => {
      // Create workflow instance
      const instance = await tx.workflowInstance.create({
        data: {
          workflowDefinitionId: trigger.workflowDefinitionId,
          currentStateId: startState.id,
          context: dto.payload || {},
          organizationId,
        },
      });

      // Create execution log for initial state
      await tx.workflowExecutionLog.create({
        data: {
          workflowInstanceId: instance.id,
          fromStateId: null, // Initial creation
          toStateId: startState.id,
          triggeredById: userId,
          organizationId,
        },
      });

      // Create trigger event (immutable audit log)
      const event = await tx.workflowTriggerEvent.create({
        data: {
          workflowTriggerId: trigger.id,
          workflowInstanceId: instance.id,
          payload: dto.payload || {},
          triggeredById: userId,
          organizationId,
        },
      });

      return {
        eventId: event.id,
        workflowInstanceId: instance.id,
        triggerId: trigger.id,
        eventKey: trigger.eventKey,
      };
    });
  }

  async findEvent(id: string) {
    const event = await this.prisma.client.workflowTriggerEvent.findUnique({
      where: { id },
      include: {
        workflowTrigger: {
          select: {
            id: true,
            eventKey: true,
          },
        },
        workflowInstance: {
          select: {
            id: true,
            status: true,
            currentStateId: true,
          },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Trigger event not found");
    }

    return event;
  }
}
