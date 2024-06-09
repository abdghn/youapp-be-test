import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../user/decorator/user.decorator';

@ApiTags('message')
@Controller('')
export class MessageController {
  constructor(private messageService: MessageService) {}

  @Post('sendMessage')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async sendMessage(
    @User() user: any,
    @Body() createMessageDto: CreateMessageDto,
    @Res() res,
  ) {
    try {
      createMessageDto.senderId = user.id;
      const message = await this.messageService.sendMessage(createMessageDto);
      res.json({
        statusCode: HttpStatus.OK,
        data: message,
      });
    } catch (e) {
      const status = e instanceof HttpException ? e.getStatus() : 500;
      res.status(status).json({
        statusCode: status,
        message: e.message,
      });
    }
  }

  @Get('viewMessages')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async viewMessages(@Res() res, @User() user: any) {
    try {
      const myMessages = await this.messageService.getMessages(user.id);
      res.json({
        statusCode: HttpStatus.OK,
        data: myMessages,
      });
    } catch (e) {
      const status = e instanceof HttpException ? e.getStatus() : 500;
      res.status(status).json({
        statusCode: status,
        message: e.message,
      });
    }
  }
}
