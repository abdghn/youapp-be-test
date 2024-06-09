import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import { HttpStatus, HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { getHoroscopeSign, getZodiac } from '../util/zodiac-helper';

const mockUserService = {
  saveUser: jest.fn(),
};

const mockUser = {
  id: 'userId',
  username: 'testuser',
  email: 'testuser@example.com',
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      await controller.getProfile(res, mockUser);

      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        data: mockUser,
      });
    });

    it('should handle unauthorized error', async () => {
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      const error = new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
      jest.spyOn(res, 'json').mockImplementation(() => {
        throw error;
      });

      try {
        await controller.getProfile(res, mockUser);
      } catch (e) {
        expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
        expect(res.json).toHaveBeenCalledWith({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Unauthorized',
        });
      }
    });
  });
  describe('createProfile', () => {
    it('should create user profile', async () => {
      const createUserDetailDto: CreateUserDetailDto = {
        fullname: '',
        gender: '',
        height: 0,
        horoscope: '',
        interests: ['test', 'coding'],
        weight: 0,
        zodiac: '',
        avatar: 'avatarPath',
        birthdayDate: '01-01-2000',
      };

      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      const updatedUser = { ...mockUser, ...createUserDetailDto };
      mockUserService.saveUser.mockResolvedValue(updatedUser);

      await controller.createProfile(
        res,
        { path: 'avatarPath' },
        createUserDetailDto,
        mockUser,
      );

      expect(mockUserService.saveUser).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          avatar: 'avatarPath',
          birthdayDate: '01-01-2000',
          horoscope: getHoroscopeSign(1, 1),
          zodiac: getZodiac(2000),
        }),
      );

      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Create Profile Success',
        data: updatedUser,
      });
    });

    it('should handle errors', async () => {
      const createUserDetailDto: CreateUserDetailDto = {
        fullname: '',
        gender: '',
        height: 0,
        horoscope: '',
        interests: ['test', 'coding'],
        weight: 0,
        zodiac: '',
        avatar: 'avatarPath',
        birthdayDate: '01-01-2000',
      };
      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      const error = new HttpException('Error', 500);
      mockUserService.saveUser.mockRejectedValue(error);

      await controller.createProfile(
        res,
        { path: 'avatarPath' },
        createUserDetailDto,
        mockUser,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Error',
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateUserDetailDto: CreateUserDetailDto = {
        fullname: '',
        gender: '',
        height: 0,
        horoscope: '',
        interests: ['test', 'coding'],
        weight: 0,
        zodiac: '',
        avatar: 'avatarPath',
        birthdayDate: '01-01-2000',
      };

      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      const updatedUser = { ...mockUser, ...updateUserDetailDto };
      mockUserService.saveUser.mockResolvedValue(updatedUser);

      await controller.updateProfile(
        res,
        { path: 'avatarPath' },
        updateUserDetailDto,
        mockUser,
      );

      expect(mockUserService.saveUser).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          avatar: 'avatarPath',
          birthdayDate: '01-01-2000',
          horoscope: getHoroscopeSign(1, 1),
          zodiac: getZodiac(2000),
        }),
      );

      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.CREATED,
        message: 'Update Profile Success',
        data: updatedUser,
      });
    });

    it('should handle errors', async () => {
      const updateUserDetailDto: CreateUserDetailDto = {
        fullname: '',
        gender: '',
        height: 0,
        horoscope: '',
        interests: ['test', 'coding'],
        weight: 0,
        zodiac: '',
        avatar: 'avatarPath',
        birthdayDate: '01-01-2000',
      };

      const res = {
        json: jest.fn().mockReturnThis(),
        status: jest.fn().mockReturnThis(),
      };

      const error = new HttpException('Error', 500);
      mockUserService.saveUser.mockRejectedValue(error);

      await controller.updateProfile(
        res,
        { path: 'avatarPath' },
        updateUserDetailDto,
        mockUser,
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Error',
      });
    });
  });
});
