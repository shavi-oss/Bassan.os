import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { WorkflowInstancesService } from "./workflow-instances.service";
import { InitiateWorkflowDto } from "./dto/initiate-workflow.dto";
import { TransitionWorkflowDto } from "./dto/transition-workflow.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../shared/guards/tenant.guard";

/**
 * WorkflowInstancesController
 *
 * Stage 3 Runtime Endpoints (ONLY these 4):
 * - POST /workflow-instances
 * - GET  /workflow-instances/:id
 * - POST /workflow-instances/:id/transition
 * - GET  /workflow-instances/:id/history
 *
 * Security:
 * - All endpoints protected by JwtAuthGuard + TenantGuard
 * - Cross-tenant access returns 404 (not 403)
 */
@Controller("workflow-instances")
@UseGuards(JwtAuthGuard, TenantGuard)
export class WorkflowInstancesController {
  constructor(
    private readonly workflowInstancesService: WorkflowInstancesService,
  ) {}

  /**
   * POST /workflow-instances
   * Start a new workflow instance from ACTIVE definition
   */
  @Post()
  async create(@Body() dto: InitiateWorkflowDto, @Request() req: any) {
    return this.workflowInstancesService.create(
      dto,
      req.user.id,
      req.user.organizationId,
    );
  }

  /**
   * GET /workflow-instances/:id
   * Get instance status
   */
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) {
    return this.workflowInstancesService.findOne(id, req.user.organizationId);
  }

  /**
   * POST /workflow-instances/:id/transition
   * Move to next state
   */
  @Post(":id/transition")
  async transition(
    @Param("id") id: string,
    @Body() dto: TransitionWorkflowDto,
    @Request() req: any,
  ) {
    return this.workflowInstancesService.transition(
      id,
      dto,
      req.user.id,
      req.user.organizationId,
    );
  }

  /**
   * GET /workflow-instances/:id/history
   * Get execution log
   */
  @Get(":id/history")
  async getHistory(@Param("id") id: string, @Request() req: any) {
    return this.workflowInstancesService.getHistory(
      id,
      req.user.organizationId,
    );
  }
}
