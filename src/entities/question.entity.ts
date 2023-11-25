import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { SessionEntity } from './session.entity';
import { UserEntity } from './user.entity';

@Entity()
export class QuestionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  questionKR: string;

  @Column({ nullable: true })
  questionEN: string;

  @Column({ nullable: true })
  answerKR: string;

  @Column({ nullable: true })
  answerEN: string;

  @Column({ nullable: true })
  answerFileSrc: string;

  @ManyToOne(() => UserEntity)
  student: UserEntity;

  @ManyToOne(() => SessionEntity)
  session: SessionEntity;
}
