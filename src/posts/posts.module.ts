import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { SearchModule } from '../search/search.module';
import PostsSearchService from './postsSearch.service';
import { CacheModule } from '@nestjs/common/cache';
import { ConfigModule, ConfigService } from '@nestjs/config';
import redisStore from 'cache-manager-redis-store';
import { PostResolver } from './post.resolver';
import { UsersModule } from '../users/users.module';
import { PostsLoader } from './loaders/post.loader';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        ttl: 120
      }),
    }),
    TypeOrmModule.forFeature([Post]),
    SearchModule,
    UsersModule
  ],
  controllers: [PostsController],
  providers: [PostsService, PostsSearchService, PostResolver, PostsLoader],
})
export class PostsModule {}
