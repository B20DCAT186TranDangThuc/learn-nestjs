import { PostsService } from './posts.service';
import { Post } from './models/post.model';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  Parent,
  ResolveField, Info,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GraphqlJwtAuthGuard } from '../authentication/graphql-jwt-auth.guard';
import { CreatePostInput } from './inputs/post.input';
import { RequestWithUser } from '../authentication/requestWithUser.interface';
import { UsersService } from '../users/users.service';
import { User } from '../users/models/user.model';
import { PostsLoader } from './loaders/post.loader';
import { GraphQLResolveInfo } from 'graphql/type';
import { parseResolveInfo, ResolveTree, simplifyParsedResolveInfoFragmentWithType } from 'graphql-parse-resolve-info';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private postService: PostsService,
    private readonly usersService: UsersService,
    private postLoader: PostsLoader
  ) {}

  @Query(() => [Post])
  async posts(
    @Info() info: GraphQLResolveInfo
  ) {
    const parsedInfo = parseResolveInfo(info) as ResolveTree;
    const simplifiedInfo = simplifyParsedResolveInfoFragmentWithType(
      parsedInfo,
      info.returnType
    );

    const posts = 'author' in simplifiedInfo.fields
      ? await this.postService.getPostsWidthAuthors()
      : await this.postService.getAllPosts();

    return posts.items;
  }

  @ResolveField('author', () => User)
  async getAuthor(@Parent() post: Post) {
    const { authorId } = post;
    return this.postLoader.batchAuthors.load(authorId);
  }

  @Mutation(() => Post)
  @UseGuards(GraphqlJwtAuthGuard)
  async createPost(
    @Args('input') createPostInput: CreatePostInput,
    @Context() context: { req: RequestWithUser },
  ) {
    return this.postService.createPost(createPostInput, context.req.user);
  }
}
