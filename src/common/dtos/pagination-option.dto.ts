import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Order } from '../constants/order';

export class PaginationOptionDto {
  @IsEnum(Order)
  @IsOptional()
  readonly order: Order = Order.ASC;

  @IsInt()
  @Min(1)
  @IsOptional()
  readonly page: number = 1;

  @IsInt()
  @Min(10)
  @Max(50)
  @IsOptional()
  readonly perPage: number = 10;

  @IsString()
  @IsOptional()
  readonly q?: string;

  get skip(): number {
    return (this.page - 1) * this.perPage;
  }
}
