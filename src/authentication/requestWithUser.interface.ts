import { Users } from '../users/users.entity';
import { Request } from 'express';

export interface RequestWithUser extends Request {
  user: Users
}
