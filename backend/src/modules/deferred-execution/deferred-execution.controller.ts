import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { DeferredExecutionService } from "./deferred-execution.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../shared/guards/tenant.guard";

@Controller("deferred-executions")
@UseGuards(JwtAuthGuard, TenantGuard)
export class DeferredExecutionController {
  constructor(
    private readonly deferredExecutionService: DeferredExecutionService,
  ) {}

  @Get()
  findAll() {
    return this.deferredExecutionService.findAll();
  }

  @Get(":id")
  findOne(@Param("id", ParseUUIDPipe) id: string) {
    return this.deferredExecutionService.findOne(id);
  }

  @Get(":id/attempts")
  findAttempts(@Param("id", ParseUUIDPipe) id: string) {
    return this.deferredExecutionService.findAttempts(id);
  }

  @Post(":id/retry")
  retry(@Param("id", ParseUUIDPipe) id: string) {
    return this.deferredExecutionService.retry(id);
  }
}
