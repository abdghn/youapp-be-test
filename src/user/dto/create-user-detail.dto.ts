import { ApiPropertyOptional } from '@nestjs/swagger';
import { Matches } from 'class-validator';

export class CreateUserDetailDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  avatar: any;

  @ApiPropertyOptional()
  fullname?: string;

  @ApiPropertyOptional()
  gender?: string;

  @ApiPropertyOptional()
  @Matches(/^([0-2][0-9]|(3)[0-1])(-)(((0)[0-9])|((1)[0-2]))(-)\d{4}$/i, {
    message: '$property must be formatted as dd-mm-yyyy',
  })
  birthdayDate?: string;

  @ApiPropertyOptional()
  horoscope?: string;

  @ApiPropertyOptional()
  zodiac?: string;

  @ApiPropertyOptional()
  height: number;

  @ApiPropertyOptional()
  weight?: number;

  @ApiPropertyOptional()
  interests?: Array<string> = [];
}
