import { Module, Global } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { PrismaTenantExtension } from "../core/database/prisma.extension";

@Global()
@Module({
  providers: [PrismaTenantExtension, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
