import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { PublicFile } from './public-file.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PrivateFile } from './private-file.entity';

@Module({
  imports:[ConfigModule, TypeOrmModule.forFeature([PublicFile, PrivateFile])],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
