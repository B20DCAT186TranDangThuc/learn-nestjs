import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetCommentsQuery } from '../impl/get-comments.query';
import { Comment } from '../../comment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@QueryHandler(GetCommentsQuery)
export class GetCommentsHandler implements IQueryHandler<GetCommentsQuery> {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
  ) {}

  async execute(query: GetCommentsQuery) {
    if (query.postId) {
      return this.commentsRepository.find({
        where: { post: { id: query.postId } },
        relations: ['author', 'post'],
      });
    }
    return this.commentsRepository.find();
  }
}
