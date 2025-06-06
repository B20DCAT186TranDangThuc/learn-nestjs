import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { SubscribersController } from './subscribers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriber } from './subscribers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  providers: [SubscribersService],
  exports: [],
  controllers: [SubscribersController],
})
export class SubscribersModule {}
