import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AuthModule } from "./modules/auth/auth.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { WorkflowsModule } from "./modules/workflows/workflows.module";
import { WorkflowInstancesModule } from "./modules/workflow-instances/workflow-instances.module";
import { WorkflowTriggersModule } from "./modules/workflow-triggers/workflow-triggers.module";
import { ScheduledTriggersModule } from "./modules/scheduled-triggers/scheduled-triggers.module";
import { DeferredExecutionModule } from "./modules/deferred-execution/deferred-execution.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { ExecutorModule } from "./modules/executor/executor.module";
import { AdminModule } from "./modules/admin/admin.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SharedModule } from "./shared/shared.module";

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
    ScheduledTriggersModule,
    DeferredExecutionModule,
    SchedulerModule,
    AdminModule,
    ExecutorModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
