import {
  Controller,
  Get,
  Post,
  Put,
  UseInterceptors,
  Body,
  Res,
  UploadedFile,
  HttpStatus,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { UserService } from './user.service';
import { multerOptionsProfile } from '../middleware/multer.middleware';
import { User } from './decorator/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { getHoroscopeSign, getZodiac } from '../util/zodiac-helper';

@ApiTags('user')
@Controller('')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('getProfile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getProfile(@Res() res, @User() user: any) {
    try {
      res.json({
        statusCode: HttpStatus.OK,
        data: user,
      });
    } catch (e) {
      const status =
        e instanceof HttpException ? e.getStatus() : HttpStatus.UNAUTHORIZED;
      res.status(status).json({
        statusCode: status,
        message: e.message,
      });
    }
  }

  @ApiConsumes('multipart/form-data')
  @Post('createProfile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar', multerOptionsProfile))
  async createProfile(
    @Res() res,
    @UploadedFile() avatar,
    @Body() data: CreateUserDetailDto,
    @User() user: any,
  ) {
    try {
      data.avatar = avatar ? avatar.path : null;
      const birthday = data.birthdayDate;
      if (birthday || typeof birthday === 'string') {
        const dateParts = birthday.split('-');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        data.horoscope = getHoroscopeSign(day, month);
        data.zodiac = getZodiac(year);
      }

      const updatedUser = await this.userService.saveUser(user.id, data);

      res.json({
        statusCode: HttpStatus.CREATED,
        message: 'Create Profile Success',
        data: updatedUser,
      });
    } catch (e) {
      const status = e instanceof HttpException ? e.getStatus() : 500;
      res.status(status).json({
        statusCode: status,
        message: e.message,
      });
    }
  }

  @ApiConsumes('multipart/form-data')
  @Put('updateProfile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('avatar', multerOptionsProfile))
  async updateProfile(
    @Res() res,
    @UploadedFile() avatar,
    @Body() data: CreateUserDetailDto,
    @User() user: any,
  ) {
    try {
      data.avatar = avatar ? avatar.path : null;
      const birthday = data.birthdayDate;
      if (birthday || typeof birthday === 'string') {
        const dateParts = birthday.split('-');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10);
        const year = parseInt(dateParts[2], 10);
        data.horoscope = getHoroscopeSign(day, month);
        data.zodiac = getZodiac(year);
      }

      const updatedUser = await this.userService.saveUser(user.id, data);

      res.json({
        statusCode: HttpStatus.CREATED,
        message: 'Update Profile Success',
        data: updatedUser,
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
