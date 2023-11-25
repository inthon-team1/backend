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

  @Column({ default: 2023 })
  year: number;

  @Column({ default: 2 })
  semester: number;

  @Column({ default: 1 })
  section: number;

  @ManyToOne(() => UserEntity)
  lecturer: UserEntity;
}
