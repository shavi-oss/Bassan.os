import { Global, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { TenantGuard } from "./guards/tenant.guard";
import { PermissionsGuard } from "./guards/permissions.guard";
import { ThrottleGuard } from "./guards/throttle.guard";

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [TenantGuard, PermissionsGuard, ThrottleGuard],
  exports: [ClsModule, TenantGuard, PermissionsGuard, ThrottleGuard],
})
export class SharedModule {}
