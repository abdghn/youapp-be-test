import { BadRequestException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import { LoginDto } from '../user/dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.userService.findByUsernameEmail(username);
    if (!user) {
      throw new NotFoundException(`User ${username} not available`);
    }

    const comparedPassword = await bcrypt.compare(password, user.password);
    if (!comparedPassword) throw new BadRequestException('Password Mismatch');

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByUsernameEmail(loginDto.username);
    if (!user) {
      throw new NotFoundException(`User ${loginDto.username} not available`);
    }

    const comparedPassword = await bcrypt.compare(
      loginDto.password,
      user.password,
    );


    if (!comparedPassword) throw new BadRequestException('Password Mismatch');

    const payload = { username: loginDto.username, sub: user.id };
    return {
      statusCode: HttpStatus.OK,
      access_token: this.jwtService.sign(payload, { expiresIn: '24h' }),
    };
  }
}
