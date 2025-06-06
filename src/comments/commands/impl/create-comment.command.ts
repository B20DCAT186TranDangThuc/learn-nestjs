import CreateCommentDto from '../../dto/create-comment.dto';
import { Users } from '../../../users/users.entity';

export class CreateCommentCommand {
  constructor(
    public readonly comment: CreateCommentDto,
    public readonly author: Users,
  ) {}
}
