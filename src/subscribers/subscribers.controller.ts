import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpException,
  Inject,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { SubscriberService } from './subscriber-service.interface';

@Controller('subscribers')
@UseInterceptors(ClassSerializerInterceptor)
export default class SubscribersController {
  private subscribersService: SubscriberService;

  constructor(@Inject('SUBSCRIBERS_PACKAGE') private client: ClientGrpc) {}

  onModuleInit() {
    this.subscribersService =
      this.client.getService<SubscriberService>('SubscribersService');
  }

  @Get()
  async getSubscribers() {
    return this.subscribersService.getAllSubscribers({});
  }

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createPost(@Body() subscriber: CreateSubscriberDto) {
    return await this.subscribersService.addSubscriber(subscriber);
  }
}
