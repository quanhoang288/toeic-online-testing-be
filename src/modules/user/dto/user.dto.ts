import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AbstractDto } from 'src/common/dto/abstract.dto';
import { UserEntity } from 'src/database/entities/user.entity';

export class UserDto extends AbstractDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userName: string;

  @ApiProperty()
  @IsString()
  phone?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(userEntity: UserEntity) {
    super({
      id: userEntity.id,
      createdAt: userEntity.createdAt,
      updatedAt: userEntity.updatedAt,
    });
    this.userName = userEntity.userName;
    this.phone = userEntity.phone;
  }
}
