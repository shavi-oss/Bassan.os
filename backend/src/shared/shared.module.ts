import { Global, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
import { TenantGuard } from "./guards/tenant.guard";

@Global()
@Module({
  imports: [
    ClsModule.forRoot({
      global: true,
      middleware: { mount: true },
    }),
  ],
  providers: [TenantGuard],
  exports: [ClsModule, TenantGuard],
})
export class SharedModule {}
