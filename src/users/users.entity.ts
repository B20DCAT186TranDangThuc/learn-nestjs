import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { Address } from './address.entity';
import { Post } from '../posts/post.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  @Expose()
  public email: string;

  @Column()
  public name: string;

  @Column()
  @Exclude()
  public password: string;

  @OneToOne(() => Address, {
    eager: true,
    cascade: true,
  })
  @JoinColumn()
  public address: Address;

  @OneToMany(() => Post,  (post: Post) => post.author)
  public posts: Post[];
}
