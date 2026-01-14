import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class CreateStateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

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
