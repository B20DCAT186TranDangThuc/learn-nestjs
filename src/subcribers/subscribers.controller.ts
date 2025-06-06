import { Controller } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';

@Controller('subcribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @MessagePattern({cmd: 'add-subscriber'})
  async addSubscriber(@Payload() subscriber: CreateSubscriberDto, @Ctx() context: RmqContext) {
    const newSubscriber = await this.subscribersService.addSubscriber(subscriber);

    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    channel.ack(originalMsg);

    return newSubscriber;
  }

  @MessagePattern({ cmd: 'get-all-subscribers' })
  getAllSubscribers() {
    return this.subscribersService.getAllSubscribers();
  }
}
