import {
  Controller,
  Body,
  UseGuards,
  Post,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { RegisterDto } from '../user/dto/register.dto';
import { ApiTags } from '@nestjs/swagger';
import { UserService } from '../user/user.service';
import { LoginDto } from '../user/dto/login.dto';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';

@ApiTags('auth')
@Controller('')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService,
  ) {}

  @Post('register')
  async register(@Res() res, @Body() data: RegisterDto): Promise<void> {
    await this.userService.register(data);
    res.json({
      statusCode: HttpStatus.CREATED,
      message: 'Registration successfully',
    });
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Body() data: LoginDto) {
    return this.authService.login(data);
  }
}
