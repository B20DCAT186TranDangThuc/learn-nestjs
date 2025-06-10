import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne, OneToMany,
  PrimaryGeneratedColumn, RelationId,
} from 'typeorm';
import { Users } from '../users/users.entity';
import { Category } from '../categories/categories.entity';
import { Comment } from '../comments/comment.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @Column('text', { array: true, nullable: true })
  public paragraphs: string[];

  @Index('post_authorId_index')
  @ManyToOne(() => Users, (author: Users) => author.posts)
  public author: Users;

  @ManyToMany(() => Category, (category) => category.posts)
  @JoinTable()
  public categories: Category[];

  @OneToMany(() => Comment, (comment: Comment) => comment.post)
  public comments: Comment[];

  @RelationId((post: Post) => post.author)
  public authorId: number;
}
