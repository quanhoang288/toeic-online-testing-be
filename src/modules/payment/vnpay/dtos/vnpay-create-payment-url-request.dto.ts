import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VnPayCreatePaymentUrlRequestDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  bankCode?: string;

  @IsString()
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  language?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  @IsString()
  orderInfo?: string;
}
