import { IsString, IsNotEmpty, IsOptional, IsBoolean } from "class-validator";

export class CreateTriggerDto {
  @IsString()
  @IsNotEmpty()
  eventKey: string;

  @IsString()
  @IsNotEmpty()
  workflowDefinitionId: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
