import { BadRequestException } from '@nestjs/common';
import { UserEntity } from 'src/database/entities/user.entity';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserRepository } from './user.repository';

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}
  async create(registerDto: UserRegisterDto): Promise<UserEntity> {
    const existingUser = await this.userRepository.findByUserName(
      registerDto.userName,
    );
    if (existingUser) {
      throw new BadRequestException();
    }

    return this.userRepository.save(registerDto);
  }
}
