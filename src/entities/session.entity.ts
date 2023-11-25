import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LectureEntity } from './lecture.entity';

@Entity()
export class SessionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dateString: string;

  @Column({ default: 0 })
  number: number;

  @ManyToOne(() => LectureEntity)
  lecture: LectureEntity;
}
