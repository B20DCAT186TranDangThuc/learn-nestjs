import { Module } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscriber } from './subscribers.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subscriber])],
  exports: [],
  controllers: [SubscribersService],
})
export class SubscribersModule {}
