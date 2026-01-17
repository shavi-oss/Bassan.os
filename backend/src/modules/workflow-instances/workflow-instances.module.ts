import { Module } from "@nestjs/common";
import { WorkflowInstancesController } from "./workflow-instances.controller";
import { WorkflowInstancesService } from "./workflow-instances.service";
import { WorkflowEngineService } from "./workflow-engine.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowInstancesController],
  providers: [WorkflowInstancesService, WorkflowEngineService],
})
export class WorkflowInstancesModule {}
