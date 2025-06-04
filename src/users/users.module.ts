import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from './users.entity';
import { UsersService } from './users.service';
import { FilesModule } from '../files/files.module';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Users]), FilesModule],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
