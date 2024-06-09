import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateMessageDto {
  senderId: string;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty()
  receiverId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  content: string;
}
