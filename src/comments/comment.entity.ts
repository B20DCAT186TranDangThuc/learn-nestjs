import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../users/users.entity';
import { Post } from '../posts/post.entity';


@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public content: string;

  @ManyToOne(() => Post, (post: Post) => post.comments)
  public post: Post;

  @ManyToOne(() => Users, (author: Users) => author.posts)
  public author: Users;
}
