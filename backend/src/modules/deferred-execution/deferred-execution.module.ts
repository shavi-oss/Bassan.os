import { Module } from "@nestjs/common";
import { DeferredExecutionService } from "./deferred-execution.service";
import { DeferredExecutionController } from "./deferred-execution.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [DeferredExecutionController],
  providers: [DeferredExecutionService],
})
export class DeferredExecutionModule {}
