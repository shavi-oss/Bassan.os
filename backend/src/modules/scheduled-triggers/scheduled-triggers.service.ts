import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateScheduledTriggerDto } from "./dto/create-scheduled-trigger.dto";
import { UpdateScheduledTriggerDto } from "./dto/update-scheduled-trigger.dto";

@Injectable()
export class ScheduledTriggersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateScheduledTriggerDto) {
    if (!createDto.cronExpression && !createDto.delaySeconds) {
      throw new BadRequestException(
        "Either cronExpression or delaySeconds must be provided",
      );
    }

    // Verify workflow definition exists and is active (scoped by tenant via extension/CLS)
    const workflowDefinition =
      await this.prisma.client.workflowDefinition.findFirst({
        where: { id: createDto.workflowDefinitionId, isActive: true },
      });

    if (!workflowDefinition) {
      throw new BadRequestException(
        "Workflow definition not found or inactive",
      );
    }

    return this.prisma.client.scheduledTrigger.create({
      data: {
        ...createDto,
        // organizationId is injected by the Prisma extension via CLS
      },
    });
  }

  async findAll() {
    return this.prisma.client.scheduledTrigger.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string) {
    const trigger = await this.prisma.client.scheduledTrigger.findFirst({
      where: { id },
    });

    if (!trigger) {
      throw new NotFoundException(`Scheduled trigger with ID ${id} not found`);
    }

    return trigger;
  }

  async update(id: string, updateDto: UpdateScheduledTriggerDto) {
    // Check existence first
    await this.findOne(id);

    // Use updateMany to ensure we don't bypass any ID-based scope if findUnique were used
    // Although extension might handle it, the instruction says "Avoid findUnique(id)"
    const { count } = await this.prisma.client.scheduledTrigger.updateMany({
      where: { id },
      data: updateDto,
    });

    if (count === 0) {
      // Should not happen if findOne passed, unless race condition or scope issue
      throw new NotFoundException(
        `Scheduled trigger with ID ${id} not found during update`,
      );
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    // Check existence first
    await this.findOne(id);

    const { count } = await this.prisma.client.scheduledTrigger.deleteMany({
      where: { id },
    });

    if (count === 0) {
      throw new NotFoundException(
        `Scheduled trigger with ID ${id} not found during delete`,
      );
    }

    return { params: { id } };
  }
}
