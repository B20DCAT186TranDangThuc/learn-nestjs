import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import CreateCommentDto from './dto/create-comment.dto';
import { RequestWithUser } from '../authentication/requestWithUser.interface';
import { CreateCommentCommand } from './commands/impl/create-comment.command';
import { GetCommentsQuery } from './queries/impl/get-comments.query';
import GetCommentsDto from './dto/get-comments.dto';

@Controller('comments')
@UseInterceptors(ClassSerializerInterceptor)
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post()
  @UseGuards(JwtAuthenticationGuard)
  async createComment(
    @Body() comment: CreateCommentDto,
    @Req() req: RequestWithUser,
  ) {
    const user = req.user;
    return this.commandBus.execute(new CreateCommentCommand(comment, user));
  }

  @Get()
  async getComments(@Query() { postId }: GetCommentsDto) {
    return this.queryBus.execute(new GetCommentsQuery(postId));
  }
}
