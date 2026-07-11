import { Controller, Post, Get, Body, Param, UseGuards } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permissions.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { TenantGuard } from "../../shared/guards/tenant.guard";
import { PermissionsGuard } from "../../shared/guards/permissions.guard";
import { RequirePermission } from "../../shared/decorators/require-permission.decorator";

@Controller("roles")
@UseGuards(JwtAuthGuard, TenantGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermission("roles", "write")
  async create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.rolesService.findAll();
  }

  @Post(":roleId/permissions")
  @UseGuards(PermissionsGuard)
  @RequirePermission("roles", "write")
  async assignPermissions(
    @Param("roleId") roleId: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(roleId, dto);
  }

  @Get(":roleId/permissions")
  async getPermissions(@Param("roleId") roleId: string) {
    return this.rolesService.getPermissions(roleId);
  }
}
