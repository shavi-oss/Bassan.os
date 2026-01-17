import { IsString, IsNotEmpty, IsOptional, IsObject } from "class-validator";

export class InitiateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  workflowDefinitionId: string;

  @IsObject()
  @IsOptional()
  context?: Record<string, any>;
}
