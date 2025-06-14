import { NotFoundException } from '@nestjs/common';

export class PostNotFoundException extends NotFoundException {
  constructor(postId: number) {
    super(`Post with ID ${postId} not found`);
  }
}
