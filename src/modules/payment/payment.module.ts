import { Module } from '@nestjs/common';
import { VnpayPaymentModule } from './vnpay/vnpay-payment.module';

@Module({
  imports: [VnpayPaymentModule],
  exports: [VnpayPaymentModule],
})
export class PaymentModule {}
