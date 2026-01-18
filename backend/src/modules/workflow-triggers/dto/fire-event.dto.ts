import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class FireEventDto {
  @IsString()
  @IsNotEmpty()
  eventKey: string;

  @IsOptional()
  @Type(() => Object)
  payload?: any; // Json context data
}
