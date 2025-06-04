import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { PublicFile } from './public-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports:[ConfigModule, TypeOrmModule.forFeature([PublicFile])],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
