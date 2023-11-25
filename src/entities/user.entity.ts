import { userRole } from 'src/common';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: [userRole.professor, userRole.student] })
  role: userRole;
}
