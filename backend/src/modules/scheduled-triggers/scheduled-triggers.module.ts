import { Module } from "@nestjs/common";
import { ScheduledTriggersService } from "./scheduled-triggers.service";
import { ScheduledTriggersController } from "./scheduled-triggers.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [ScheduledTriggersController],
  providers: [ScheduledTriggersService],
})
export class ScheduledTriggersModule {}
