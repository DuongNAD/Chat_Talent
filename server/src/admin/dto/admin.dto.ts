import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateInviteDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  expiresInDays?: number;
}
