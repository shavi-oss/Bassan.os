import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsTimeZone,
  Min,
} from "class-validator";

export class UpdateScheduledTriggerDto {
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
