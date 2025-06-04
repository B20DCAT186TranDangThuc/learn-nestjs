import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../users/users.entity';
import { Category } from '../categories/categories.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public title: string;

  @Column()
  public content: string;

  @ManyToOne(() => Users, (author: Users) => author.posts)
  public author: Users;

  @ManyToMany(() => Category, category => category.posts)
  @JoinTable()
  public categories: Category[];
}
