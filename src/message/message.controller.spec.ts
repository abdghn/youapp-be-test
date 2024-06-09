import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { HttpStatus, HttpException } from '@nestjs/common';

describe('MessageController', () => {
  let controller: MessageController;
  let service: MessageService;

  const mockMessageService = {
    sendMessage: jest.fn(),
    getMessages: jest.fn(),
  };

  const mockUser = { id: 'userId' };
  const mockMessage = {
    _id: 'someId',
    content: 'Hello',
    senderId: 'userId',
    receiverId: 'receiverId',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    service = module.get<MessageService>(MessageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('sendMessage', () => {
    it('should send a message', async () => {
      const res = {
        json: jest.fn(),
      };
      const createMessageDto: CreateMessageDto = {
        content: 'Hello',
        senderId: 'userId',
        receiverId: 'receiverId',
      };

      mockMessageService.sendMessage.mockResolvedValue(mockMessage);

      await controller.sendMessage(mockUser, createMessageDto, res);

      expect(service.sendMessage).toHaveBeenCalledWith(createMessageDto);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        data: mockMessage,
      });
    });

    it('should handle errors', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const createMessageDto: CreateMessageDto = {
        content: 'Hello',
        senderId: 'userId',
        receiverId: 'receiverId',
      };

      const error = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      mockMessageService.sendMessage.mockRejectedValue(error);

      await controller.sendMessage(mockUser, createMessageDto, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error',
      });
    });
  });

  describe('viewMessages', () => {
    it('should return messages', async () => {
      const res = {
        json: jest.fn(),
      };
      const messages = [mockMessage];

      mockMessageService.getMessages.mockResolvedValue(messages);

      await controller.viewMessages(res, mockUser);

      expect(service.getMessages).toHaveBeenCalledWith(mockUser.id);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.OK,
        data: messages,
      });
    });

    it('should handle errors', async () => {
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const error = new HttpException(
        'Error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      mockMessageService.getMessages.mockRejectedValue(error);

      await controller.viewMessages(res, mockUser);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(res.json).toHaveBeenCalledWith({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error',
      });
    });
  });
});
