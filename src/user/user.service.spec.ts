import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from './user.service';
import { User, UserDocument } from './schema/user.schema';
import { NotFoundException } from '@nestjs/common';
import { CreateUserDetailDto } from './dto/create-user-detail.dto';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { Model } from 'mongoose';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let model: any;
  let userModel: Model<UserDocument>;

  const mockUser = {
    _id: 'user123',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    save: jest.fn().mockResolvedValue(this),
  };

  const mockCreateUserDetailDto: CreateUserDetailDto = {
    fullname: 'Test User',
    gender: 'Male',
    birthdayDate: '1990-01-01',
    horoscope: 'Capricorn',
    zodiac: 'Horse',
    height: 180,
    weight: 75,
    interests: ['Reading', 'Sports'],
    avatar: 'avatar.png',
  };

  const mockRegisterDto: RegisterDto = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'testpassword',
  };

  const mockUserModel = {
    findOne: jest.fn().mockReturnThis(),
    select: jest.fn().mockResolvedValue(mockUser),
    findById: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockUser),
    new: jest.fn().mockImplementation((dto) => ({
      ...dto,
      save: jest.fn().mockResolvedValue(mockUser),
    })),
    constructor: jest.fn().mockReturnThis(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get(getModelToken(User.name));
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword');
      jest.spyOn(userModel, 'create').mockResolvedValue(mockUser as any);

      const result = await service.register(mockRegisterDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(mockRegisterDto.password, 10);
      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          username: mockRegisterDto.username,
          email: mockRegisterDto.email,
          password: 'hashedpassword',
        }),
      );
      expect(result).toEqual(mockUser);
    });

    it('should handle errors', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(
        new Error('this.userModel is not a constructor'),
      );

      await expect(service.register(mockRegisterDto)).rejects.toThrow(
        'this.userModel is not a constructor',
      );
    });
  });
  describe('findByUsernameEmail', () => {
    it('should return a user if username exists', async () => {
      const user = await service.findByUsernameEmail('testuser');
      expect(user).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ username: 'testuser' });
      expect(model.select).toHaveBeenCalledWith('+password');
    });

    it('should return a user if email exists', async () => {
      const user = await service.findByUsernameEmail('test@example.com');
      expect(user).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(model.select).toHaveBeenCalledWith('+password');
    });

    it('should throw a NotFoundException if user does not exist', async () => {
      model.select.mockResolvedValueOnce(null);
      await expect(
        service.findByUsernameEmail('nonexistentuser'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      const result = await service.findById('user123');
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
    });
  });

  describe('saveUser', () => {
    it('should save user details', async () => {
      mockUserModel.findById.mockResolvedValue(mockUser);
      mockUser.save.mockResolvedValue(mockUser);

      const result = await service.saveUser('user123', mockCreateUserDetailDto);
      expect(result).toEqual(mockUser);
      expect(mockUserModel.findById).toHaveBeenCalledWith('user123');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserModel.findById.mockResolvedValue(null);
      await expect(
        service.saveUser('nonexistent', mockCreateUserDetailDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
