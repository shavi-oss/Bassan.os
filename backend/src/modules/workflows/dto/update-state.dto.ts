import { IsString, IsBoolean, IsOptional } from 'class-validator';

export class UpdateStateDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isStart?: boolean;

  @IsBoolean()
  @IsOptional()
  isEnd?: boolean;
}
