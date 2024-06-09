import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../user/dto/login.dto';
import * as bcrypt from 'bcrypt';
import {
  BadRequestException,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsernameEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should throw "User testuser not available" exception if user does not exist', async () => {
      jest.spyOn(userService, 'findByUsernameEmail').mockResolvedValue(null);
      const obj = { username: 'testuser', password: 'testpassword' };

      await expect(
        authService.validateUser(obj.username, obj.password),
      ).rejects.toThrow(
        new NotFoundException(`User ${obj.username} not available`),
      );
    });

    it('should throw "Password Mismatch" exception if password does not match', async () => {
      const user = { username: 'testuser', password: 'hashedpassword' };
      jest.spyOn(userService, 'findByUsernameEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.validateUser('testuser', 'wrongpassword'),
      ).rejects.toThrow(new BadRequestException('Password Mismatch'));
    });

    it('should return the user if password matches', async () => {
      const user = { username: 'testuser', password: 'hashedpassword' };
      jest.spyOn(userService, 'findByUsernameEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(
        'testuser',
        'correctpassword',
      );

      expect(result).toBe(user);
    });
  });

  describe('login', () => {
    it('should throw "User Not Found" exception if user does not exist', async () => {
      jest.spyOn(userService, 'findByUsernameEmail').mockResolvedValue(null);

      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'testpassword',
      };
      await expect(authService.login(loginDto)).rejects.toThrow(
        new NotFoundException(`User ${loginDto.username} not available`),
      );
    });

    it('should throw "Password Mismatch" exception if password does not match', async () => {
      const user = { username: 'testuser', password: 'hashedpassword' };
      jest.spyOn(userService, 'findByUsernameEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'wrongpassword',
      };
      await expect(authService.login(loginDto)).rejects.toThrow(
        new BadRequestException('Password Mismatch'),
      );
    });

    it('should return access token if credentials are valid', async () => {
      const user = { id: 1, username: 'testuser', password: 'hashedpassword' };
      const token = 'some_token';
      jest.spyOn(userService, 'findByUsernameEmail').mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'correctpassword',
      };
      const result = await authService.login(loginDto);

      expect(result).toEqual({
        statusCode: HttpStatus.OK,
        access_token: token,
      });
    });
  });
});
