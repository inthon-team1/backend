import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { UserEntity } from './user.entity';

@Entity()
export class LectureEntity {
  @PrimaryColumn()
  id: string;

  @Column({ nullable: true })
  titleKR: string;

  @Column({ nullable: true })
  descriptionKR: string;

  @Column({ nullable: true })
  titleEN: string;

  @Column({ nullable: true })
  descriptionEN: string;

  @ManyToOne(() => UserEntity)
  lecturer: UserEntity;
}
