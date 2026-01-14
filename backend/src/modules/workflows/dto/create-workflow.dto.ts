import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
