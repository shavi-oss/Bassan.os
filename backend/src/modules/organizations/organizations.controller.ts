import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../shared/guards/tenant.guard';

@Controller('organizations')
@UseGuards(JwtAuthGuard, TenantGuard)
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  async create(@Body() dto: CreateOrganizationDto) {
    return this.organizationsService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    return this.organizationsService.findOne(id, req.user.organizationId);
  }
}
