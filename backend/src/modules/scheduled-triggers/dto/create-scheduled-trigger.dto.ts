import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
  Min,
} from "class-validator";

export class CreateScheduledTriggerDto {
  @IsUUID()
  workflowDefinitionId: string;

  @IsOptional()
  @IsString()
  cronExpression?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  delaySeconds?: number;

  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
