import { Module } from '@nestjs/common';
import { VnpayPaymentService } from './vnpay-payment.service';
import { VnpayPaymentController } from './vnpay-payment.controller';

@Module({
  providers: [VnpayPaymentService],
  controllers: [VnpayPaymentController],
  exports: [VnpayPaymentService],
})
export class VnpayPaymentModule {}
