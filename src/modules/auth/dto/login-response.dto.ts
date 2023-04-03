import { ApiProperty } from '@nestjs/swagger';
import { TokenPayloadDto } from './token-payload.dto';

export class LoginResponseDto {
  @ApiProperty({ type: TokenPayloadDto })
  token: TokenPayloadDto;

  constructor(data: { token: TokenPayloadDto }) {
    this.token = data.token;
  }
}
