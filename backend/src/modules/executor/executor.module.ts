import { Module } from "@nestjs/common";
import { PrismaModule } from "../../prisma/prisma.module";
import { ExecutorService } from "./executor.service";

/**
 * Executor Module
 *
 * Provides background execution service for deferred workflow instances.
 * Stage 6 Gate 4
 */
@Module({
  imports: [PrismaModule],
  providers: [ExecutorService],
  exports: [ExecutorService],
})
export class ExecutorModule {}
