import { IsString, IsNotEmpty, IsArray } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray()
  @IsNotEmpty()
  permissions: Array<{
    action: string;
    resource: string;
  }>;
}
