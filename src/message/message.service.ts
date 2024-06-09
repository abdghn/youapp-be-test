import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as amqp from 'amqplib';
import { Message, MessageDocument } from './schema/message.schema';
import { User, UserDocument } from '../user/schema/user.schema';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessageService {
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {
    this.connectToRabbitMQ();
  }

  async connectToRabbitMQ() {
    this.connection = await amqp.connect(process.env.RABBITMQ_URI);
    this.channel = await this.connection.createChannel();
    this.channel.assertQueue('messages', { durable: true });
  }
  async sendMessage(createMessageDto: CreateMessageDto) {
    const message = await this.userModel.create(createMessageDto);
    this.channel.sendToQueue('messages', Buffer.from(JSON.stringify(message)));
    return message;
  }

  async getMessages(userId: string): Promise<Message[]> {
    return this.messageModel
      .find({ receiverId: userId })
      .populate({ path: 'senderId', select: 'fullname horoscope zodiac' })
      .exec();
  }
}
