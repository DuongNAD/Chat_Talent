import { IsString, IsUUID, IsOptional, MaxLength } from 'class-validator';

export class CreateGroupDto {
  @IsString()
  @MaxLength(100)
  groupName!: string;
}

export class SendMessageDto {
  @IsUUID()
  groupId!: string;

  @IsString()
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;
}

export class EditMessageDto {
  @IsUUID()
  messageId!: string;

  @IsString()
  @MaxLength(5000)
  content!: string;
}
