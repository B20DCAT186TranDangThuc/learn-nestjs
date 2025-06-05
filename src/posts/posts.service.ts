import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, MoreThan, Repository } from 'typeorm';
import { PostNotFoundException } from './exception/post-not-found.exception';
import { Users } from '../users/users.entity';
import PostsSearchService from './postsSearch.service';

@Injectable()
export class PostsService {
  private lastPostId = 0;
  private posts: Post[] = [];

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    private postsSearchService: PostsSearchService,
  ) {}

  async getAllPosts(offset?: number, limit?: number, startId?: number) {
    // return this.postsRepository.createQueryBuilder('post')
    //   .leftJoinAndSelect('post.author', 'author')
    //   .leftJoinAndSelect('post.categories', 'categories')
    //   .select([
    //     'post.id',
    //     'post.title',
    //     'post.content',
    //     'author.id',         // chỉ lấy id của author
    //     'author.name',   // ví dụ lấy thêm username
    //     'categories.id',       // chỉ lấy id category
    //     'categories.name',
    //   ])
    //   .getMany()
    const where: FindManyOptions<Post>['where'] = {};
    let separateCount = 0;
    if (startId) {
      where.id = MoreThan(startId);
      separateCount = await this.postsRepository.count();
    }

    const [items, count] = await this.postsRepository.findAndCount({
      where,
      relations: ['author'],
      order: {
        id: 'ASC',
      },
      skip: offset,
      take: limit,
    });

    return {
      items,
      count: startId ? separateCount : count,
    };
  }

  async getPostById(id: number) {
    const post = await this.postsRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'author.id', // chỉ lấy id của author
        'author.name', // ví dụ lấy thêm username
        'categories.id', // chỉ lấy id category
        'categories.name',
      ])
      .where('post.id = :id', { id })
      .getOne();
    if (post) {
      return post;
    }
    throw new PostNotFoundException(id);
  }

  async updatePost(id: number, post: UpdatePostDto) {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });
    if (updatedPost) {
      await this.postsSearchService.update(updatedPost);
      return updatedPost;
    }
    throw new PostNotFoundException(id);
  }

  async createPost(post: CreatePostDto, user: Users) {
    const newPost = this.postsRepository.create({
      ...post,
      author: user,
    });
    await this.postsRepository.save(newPost);
    await this.postsSearchService.indexPost(newPost);
    return newPost;
  }

  async deletePost(id: number) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
    await this.postsSearchService.remove(id);
  }

  async searchForPosts(text: string, offset?: number, limit?: number, startId?: number) {
    const { results, count } = await this.postsSearchService.search(text, offset, limit, startId);
    const ids = results.map(result => result.id);
    if (!ids.length) {
      return {
        items: [],
        count
      }
    }
    const items = await this.postsRepository
      .find({
        where: { id: In(ids) }
      });
    return {
      items,
      count
    }
  }

  async createMultiplePosts(posts: CreatePostDto[], user: Users) {
    const results: Post[] = [];
    for (const post of posts) {
      const newPost = await this.createPost(post, user);
      results.push(newPost);
    }
    if (!results.length) {
      throw new HttpException('No posts were created', HttpStatus.BAD_REQUEST);
    }
    return results;
  }

  async getPostsWithParagraph(paragraph: string) {
    return this.postsRepository.query(
      'SELECT * from post WHERE $1 = ANY(paragraphs)',
      [paragraph],
    );
  }
}
