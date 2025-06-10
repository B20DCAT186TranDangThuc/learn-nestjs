import { PostsService } from './posts.service';
import { Post } from './post.model';
import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphqlJwtAuthGuard } from '../authentication/graphql-jwt-auth.guard';
import { CreatePostInput } from './post.input';
import { RequestWithUser } from '../authentication/requestWithUser.interface';
@Resolver(() => Post)
export class PostResolver {
  constructor(private postService: PostsService) {}

  @Query(() => [Post])
  async posts() {
    const posts = await this.postService.getAllPosts();
    return posts.items;
  }

  @Mutation(() => Post)
  @UseGuards(GraphqlJwtAuthGuard)
  async createPost(
    @Args('input') createPostInput: CreatePostInput,
    @Context() context: { req: RequestWithUser}
  ) {
    return this.postService.createPost(createPostInput, context.req.user);
  }
}
