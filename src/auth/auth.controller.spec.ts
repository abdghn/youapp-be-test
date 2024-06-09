import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';
import { RegisterDto } from '../user/dto/register.dto';
import { LoginDto } from '../user/dto/login.dto';
import { HttpStatus } from '@nestjs/common';
import { Response } from 'express';

describe('AuthController', () => {
  let authController: AuthController;
  let userService: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: UserService,
          useValue: {
            register: jest.fn(),
          },
        },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should register a user and return success message', async () => {
      const registerDto: RegisterDto = {
        username: 'testuser',
        email: 'test@gmail.com',
        password: 'testpassword',
      };
      const res: Partial<Response> = {
        json: jest.fn().mockImplementation((result) => result),
      };

      await authController.register(res as Response, registerDto);

      expect(userService.register).toHaveBeenCalledWith(registerDto);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Registration successfully',
      });
    });
  });

  describe('login', () => {
    it('should login a user and return the access token', async () => {
      const loginDto: LoginDto = {
        username: 'testuser',
        password: 'testpassword',
      };
      const loginResult = {
        statusCode: HttpStatus.OK,
        access_token: 'some_token',
      };

      jest.spyOn(authService, 'login').mockResolvedValue(loginResult);

      const result = await authController.login(loginDto);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(loginResult);
    });
  });
});
