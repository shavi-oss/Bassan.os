import { Module } from "@nestjs/common";
import { WorkflowTriggersController } from "./workflow-triggers.controller";
import { WorkflowTriggersService } from "./workflow-triggers.service";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [WorkflowTriggersController],
  providers: [WorkflowTriggersService],
  exports: [WorkflowTriggersService],
})
export class WorkflowTriggersModule {}
