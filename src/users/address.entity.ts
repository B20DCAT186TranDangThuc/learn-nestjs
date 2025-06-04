import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from './users.entity';
import { Expose } from 'class-transformer';

@Entity()
export class Address {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public street: string;

  @Column()
  public city: string;

  @Column()
  public country: string;

  @OneToOne(() => Users, (user: Users) => user.address)
  public user: Users;
}
