import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class LectureEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  titleKR: string;

  @Column()
  descriptionKR: string;

  @Column()
  titleEN: string;

  @Column()
  descriptionEN: string;

  @Column()
  courseID: string;

  @ManyToOne(() => UserEntity)
  lecturer: UserEntity;
}
