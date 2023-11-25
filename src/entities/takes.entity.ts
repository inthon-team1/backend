import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { LectureEntity, UserEntity } from 'src/entities';

@Entity()
export class TakesEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  lectureId: number;

  @ManyToOne(() => UserEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @ManyToOne(() => LectureEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lectureId' })
  lecture: LectureEntity;
}
