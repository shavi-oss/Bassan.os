import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { ScheduledTriggersService } from "./scheduled-triggers.service";
import { CreateScheduledTriggerDto } from "./dto/create-scheduled-trigger.dto";
import { UpdateScheduledTriggerDto } from "./dto/update-scheduled-trigger.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../shared/guards/tenant.guard";

@Controller("scheduled-triggers")
@UseGuards(JwtAuthGuard, TenantGuard)
export class ScheduledTriggersController {
  constructor(
    private readonly scheduledTriggersService: ScheduledTriggersService,
  ) {}

  @Post()
  create(@Body() createScheduledTriggerDto: CreateScheduledTriggerDto) {
    return this.scheduledTriggersService.create(createScheduledTriggerDto);
  }

  @Get()
  findAll() {
    return this.scheduledTriggersService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.scheduledTriggersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateScheduledTriggerDto: UpdateScheduledTriggerDto,
  ) {
    return this.scheduledTriggersService.update(id, updateScheduledTriggerDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.scheduledTriggersService.remove(id);
  }
}
