import { UserEntity } from 'src/database/entities/user.entity';
import { Repository } from 'typeorm';

export class UserRepository extends Repository<UserEntity> {
  async findByUserName(userName: string): Promise<UserEntity | null> {
    return this.findOne({
      where: {
        userName,
      },
    });
  }
}
