import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
  ) {
  }

  getAllPosts() {
    return this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'author.id',         // chỉ lấy id của author
        'author.name',   // ví dụ lấy thêm username
        'categories.id',       // chỉ lấy id category
        'categories.name',
      ])
      .getMany()
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.createQueryBuilder('post')
      .leftJoinAndSelect('post.author', 'author')
      .leftJoinAndSelect('post.categories', 'categories')
      .select([
        'post.id',
        'post.title',
        'post.content',
        'author.id',         // chỉ lấy id của author
        'author.name',   // ví dụ lấy thêm username
        'categories.id',       // chỉ lấy id category
        'categories.name',
      ])
      .where('post.id = :id', { id })
      .getOne()
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

  async searchForPosts(text: string) {
    const results = await this.postsSearchService.search(text);
    const ids = results.map((res) => res.id);
    if (!ids.length) {
      return [];
    }
    return this.postsRepository.find({
      where: { id: In(ids) },
      relations: ['author', 'categories'],
    });
  }

  async createMultiplePosts(posts: CreatePostDto[], user: Users) {
    const results: Post[] = [];
    for (const post of posts) {
      const newPost = await this.createPost(post, user);
      results.push(newPost);
    }
    if (!results.length) {
      throw new HttpException(
        'No posts were created',
        HttpStatus.BAD_REQUEST,
      );
    }
    return results;
  }
}
