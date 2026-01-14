import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateTransitionDto {
  @IsString()
  @IsNotEmpty()
  fromStateId: string;

  @IsString()
  @IsNotEmpty()
  toStateId: string;

  @IsString()
  @IsOptional()
  label?: string;
}
