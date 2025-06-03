import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Post } from './post.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostNotFoundException } from './exception/post-not-found.exception';

@Injectable()
export class PostsService {
  private lastPostId = 0;
  private posts: Post[] = [];
  
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
  ) {
  }
  
  getAllPosts() {
    return this.postsRepository.find();
  }

  async getPostById(id: number) {
    const post = await this.postsRepository.findOne({
      where: {id},
    });
    if (post) {
      return post;
    }
    throw new PostNotFoundException(id);
  }


  async updatePost(id: number, post: UpdatePostDto) {
    await this.postsRepository.update(id, post);
    const updatedPost = await this.postsRepository.findOne({
      where: {id},
    });
    if (updatedPost) {
      return updatedPost
    }
    throw new PostNotFoundException(id);
  }


  async createPost(post: CreatePostDto) {
    const newPost = await this.postsRepository.create(post);
    await this.postsRepository.save(newPost);
    return newPost;
  }


  async deletePost(id: number) {
    const deleteResponse = await this.postsRepository.delete(id);
    if (!deleteResponse.affected) {
      throw new PostNotFoundException(id);
    }
  }
}
