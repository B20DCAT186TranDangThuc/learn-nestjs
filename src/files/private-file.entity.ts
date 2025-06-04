import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Users } from '../users/users.entity';
@Entity()
export class PrivateFile {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public key: string;

  @ManyToOne(() => Users, (owner: Users) => owner.files, {
    eager: true,
  })
  public owner: Users;
}
