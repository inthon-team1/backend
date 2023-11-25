import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities';
import { UserDto, UserDtoWithId } from 'src/user/dtos';
import { hash } from 'bcrypt';
import { User } from 'src/common';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findOneByUsername(username: string): Promise<UserDtoWithId> {
    const userEntity = await this.userRepository.findOne({
      where: { username },
    });
    if (!userEntity) throw new BadRequestException('invalid username');
    return {
      id: userEntity.id,
      username: userEntity.username,
      password: userEntity.password,
      role: userEntity.role,
    };
  }

  async createUser(dto: UserDto) {
    if (dto.password.length < 8 || dto.password.length > 20)
      throw new BadRequestException('password length must be between 8 and 20');
    if (dto.role !== 'professor' && dto.role !== 'student')
      throw new BadRequestException('role must be professor or student');
    const hashedPw = await hash(dto.password, 10);
    try {
      const entity = this.userRepository.create({
        username: dto.username,
        password: hashedPw,
        role: dto.role,
      });
      const savedEntity = await this.userRepository.save(entity);
      return {
        id: savedEntity.id,
        role: dto.role,
      } as User;
    } catch (err) {
      throw new BadRequestException('username already exists');
    }
  }
}
