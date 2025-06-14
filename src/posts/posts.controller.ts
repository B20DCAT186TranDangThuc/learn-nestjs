import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { FindOneParams } from '../utils/findOneParams';
import { RequestWithUser } from '../authentication/requestWithUser.interface';
import { PaginationParams } from '../utils/types/paginationParams';
import { CacheKey } from '@nestjs/common/cache';
import { GET_POSTS_CACHE_KEY } from './postsCacheKey.constant';
import { HttpCacheInterceptor } from './httpCache.interceptor';
import JwtTwoFactorGuard from '../authentication/jwt-twoFactorAuthentication.guard';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @UseInterceptors(HttpCacheInterceptor)
  @CacheKey(GET_POSTS_CACHE_KEY)
  @Get()
  async getPosts(
    @Query('search') search: string,
    @Query() { offset, limit, startId }: PaginationParams,
  ) {
    if (search) {
      return this.postsService.searchForPosts(search, offset, limit, startId);
    }
    return this.postsService.getAllPosts(offset, limit, startId);
  }

  @Get(':id')
  getPostById(@Param() { id }: FindOneParams) {
    return this.postsService.getPostById(Number(id));
  }

  @Post()
  @UseGuards(JwtTwoFactorGuard)
  async createPost(@Body() post: CreatePostDto, @Req() req: RequestWithUser) {
    return this.postsService.createPost(post, req.user);
  }

  @Put(':id')
  async replacePost(@Param('id') id: string, @Body() post: UpdatePostDto) {
    return this.postsService.updatePost(Number(id), post);
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    await this.postsService.deletePost(Number(id));
  }

  @Post('bulk')
  @UseGuards(JwtAuthenticationGuard)
  async createMultiplePosts(
    @Body() posts: CreatePostDto[],
    @Req() req: RequestWithUser,
  ) {
    return this.postsService.createMultiplePosts(posts, req.user);
  }
}
