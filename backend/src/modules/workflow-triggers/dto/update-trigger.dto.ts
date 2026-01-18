import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateTriggerDto {
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
