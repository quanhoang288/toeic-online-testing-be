import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VnPayPaymentResultDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TmnCode: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  vnp_Amount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_BankCode: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  vnp_BankTranNo?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  vnp_CardType?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  vnp_PayDate?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_OrderInfo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TransactionNo: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_ResponseCode: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TransactionStatus: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_TxnRef: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  vnp_SecureHashType?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  vnp_SecureHash: string;
}
