import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { WorkflowTriggersService } from "./workflow-triggers.service";
import { CreateTriggerDto } from "./dto/create-trigger.dto";
import { UpdateTriggerDto } from "./dto/update-trigger.dto";
import { FireEventDto } from "./dto/fire-event.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../shared/guards/tenant.guard";

@Controller("workflow-triggers")
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkflowTriggersController {
  constructor(private readonly service: WorkflowTriggersService) {}

  @Post()
  create(@Body() dto: CreateTriggerDto, @Req() req: any) {
    return this.service.create(dto, req.user.organizationId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.service.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateTriggerDto) {
    return this.service.update(id, dto);
  }

  @Post("events")
  fireEvent(@Body() dto: FireEventDto, @Req() req: any) {
    return this.service.fireEvent(dto, req.user.id, req.user.organizationId);
  }

  @Get("events/:id")
  findEvent(@Param("id") id: string) {
    return this.service.findEvent(id);
  }
}
