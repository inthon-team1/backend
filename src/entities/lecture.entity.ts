import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class LectureEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  titleKR: string;

  @Column({ nullable: true })
  descriptionKR: string;

  @Column({ nullable: true })
  titleEN: string;

  @Column({ nullable: true })
  descriptionEN: string;

  @Column()
  passKey: string;

  @ManyToOne(() => UserEntity)
  lecturer: UserEntity;
}
