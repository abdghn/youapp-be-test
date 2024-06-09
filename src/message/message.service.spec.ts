import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as amqp from 'amqplib';
import { MessageService } from './message.service';
import { Message, MessageDocument } from './schema/message.schema';
import { User, UserDocument } from '../user/schema/user.schema';
import { CreateMessageDto } from './dto/create-message.dto';

jest.mock('amqplib');

describe('MessageService', () => {
  let service: MessageService;
  let messageModel: Model<MessageDocument>;
  let userModel: Model<UserDocument>;

  const mockMessage = {
    _id: 'someid',
    content: 'Hello',
    senderId: 'senderId',
    receiverId: 'receiverId',
    save: jest.fn(),
  };

  const mockMessageModel = {
    find: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn(),
  };

  const mockUserModel = {
    create: jest.fn(),
  };

  const mockAmqp = {
    connect: jest.fn().mockResolvedValue({
      createChannel: jest.fn().mockResolvedValue({
        assertQueue: jest.fn(),
        sendToQueue: jest.fn(),
      }),
    }),
  };

  beforeAll(async () => {
    (amqp.connect as jest.Mock) = mockAmqp.connect;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: mockMessageModel,
        },
        {
          provide: getModelToken(User.name),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageModel = module.get<Model<MessageDocument>>(
      getModelToken(Message.name),
    );
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('connectToRabbitMQ', () => {
    it('should connect to RabbitMQ', async () => {
      await service.connectToRabbitMQ();
      expect(mockAmqp.connect).toHaveBeenCalledWith(process.env.RABBITMQ_URI);
    });
  });

  describe('sendMessage', () => {
    it('should save message and send to RabbitMQ', async () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Hello',
        senderId: 'senderId',
        receiverId: 'receiverId',
      };

      mockUserModel.create.mockResolvedValue(mockMessage);

      await service.connectToRabbitMQ();
      const result = await service.sendMessage(createMessageDto);

      expect(userModel.create).toHaveBeenCalledWith(createMessageDto);
      expect(result).toEqual(mockMessage);
    });
  });

  describe('getMessages', () => {
    it('should get messages for a user', async () => {
      const userId = 'receiverId';
      const messages = [mockMessage];

      mockMessageModel.exec.mockResolvedValue(messages);

      const result = await service.getMessages(userId);

      expect(messageModel.find).toHaveBeenCalledWith({ receiverId: userId });
      expect(messageModel.populate).toHaveBeenCalledWith({
        path: 'senderId',
        select: 'fullname horoscope zodiac',
      });
      expect(result).toEqual(messages);
    });
  });
});
