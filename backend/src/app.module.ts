import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { WorkflowsModule } from "./modules/workflows/workflows.module";
import { WorkflowInstancesModule } from "./modules/workflow-instances/workflow-instances.module";
import { WorkflowTriggersModule } from "./modules/workflow-triggers/workflow-triggers.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SharedModule } from "./shared/shared.module";
import { TenantMiddleware } from "./shared/middleware/tenant.middleware";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SharedModule,
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    RolesModule,
    WorkflowsModule,
    WorkflowInstancesModule,
    WorkflowTriggersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
