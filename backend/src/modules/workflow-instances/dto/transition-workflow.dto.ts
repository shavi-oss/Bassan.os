import { IsString, IsNotEmpty } from "class-validator";

export class TransitionWorkflowDto {
  @IsString()
  @IsNotEmpty()
  transitionId: string;
}
