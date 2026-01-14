import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from "@nestjs/common";
import { WorkflowsService } from "./workflows.service";
import { CreateWorkflowDto } from "./dto/create-workflow.dto";
import { UpdateWorkflowDto } from "./dto/update-workflow.dto";
import { CreateStateDto } from "./dto/create-state.dto";
import { UpdateStateDto } from "./dto/update-state.dto";
import { CreateTransitionDto } from "./dto/create-transition.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../shared/guards/tenant.guard";

@Controller("workflows")
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkflowsController {
  constructor(private readonly workflowsService: WorkflowsService) {}

  // ============================================================
  // WORKFLOW DEFINITION ENDPOINTS
  // ============================================================

  @Post()
  async create(@Body() dto: CreateWorkflowDto) {
    return this.workflowsService.create(dto);
  }

  @Get()
  async findAll() {
    return this.workflowsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.workflowsService.findOne(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateWorkflowDto) {
    return this.workflowsService.update(id, dto);
  }

  @Post(":id/activate")
  async activate(@Param("id") id: string) {
    return this.workflowsService.activate(id);
  }

  @Post(":id/archive")
  async archive(@Param("id") id: string) {
    return this.workflowsService.archive(id);
  }

  // ============================================================
  // STATES ENDPOINTS
  // ============================================================

  @Post(":id/states")
  async createState(@Param("id") id: string, @Body() dto: CreateStateDto) {
    return this.workflowsService.createState(id, dto);
  }

  @Get(":id/states")
  async getStates(@Param("id") id: string) {
    return this.workflowsService.getStates(id);
  }

  @Patch(":id/states/:stateId")
  async updateState(
    @Param("id") id: string,
    @Param("stateId") stateId: string,
    @Body() dto: UpdateStateDto,
  ) {
    return this.workflowsService.updateState(id, stateId, dto);
  }

  @Delete(":id/states/:stateId")
  async deleteState(
    @Param("id") id: string,
    @Param("stateId") stateId: string,
  ) {
    return this.workflowsService.deleteState(id, stateId);
  }

  // ============================================================
  // TRANSITIONS ENDPOINTS
  // ============================================================

  @Post(":id/transitions")
  async createTransition(
    @Param("id") id: string,
    @Body() dto: CreateTransitionDto,
  ) {
    return this.workflowsService.createTransition(id, dto);
  }

  @Get(":id/transitions")
  async getTransitions(@Param("id") id: string) {
    return this.workflowsService.getTransitions(id);
  }

  @Delete(":id/transitions/:transitionId")
  async deleteTransition(
    @Param("id") id: string,
    @Param("transitionId") transitionId: string,
  ) {
    return this.workflowsService.deleteTransition(id, transitionId);
  }
}
