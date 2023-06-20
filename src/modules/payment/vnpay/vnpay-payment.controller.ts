import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Redirect,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { VnPayCreatePaymentUrlRequestDto } from './dtos/vnpay-create-payment-url-request.dto';
import { Request, Response } from 'express';
import { VnpayPaymentService } from './vnpay-payment.service';
import { VnPayPaymentResultDto } from './dtos/vnpay-payment-result.dto';
import { UPGRADE_USER_ORDER_INFO_PATTERN } from '../../../common/utils/vnpay-util';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('payment/vnpay')
export class VnpayPaymentController {
  constructor(private readonly vnpayPaymentService: VnpayPaymentService) {}

  @Post('create-payment-url')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  createPaymentUrl(
    @Req() req: Request,
    @Res() res: Response,
    @Body() paymentInfo: VnPayCreatePaymentUrlRequestDto,
  ) {
    const redirectUrl = this.vnpayPaymentService.createPaymentUrl({
      ...paymentInfo,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip,
      orderInfo: UPGRADE_USER_ORDER_INFO_PATTERN + req.user.id,
    });
    console.log('redirect url', redirectUrl);
    res.redirect(redirectUrl);
  }

  @Get('return-url')
  @Redirect('http://localhost:3000')
  handleRedirectClient(
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    paymentRes: VnPayPaymentResultDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const isChecksumValid = this.vnpayPaymentService.verifyChecksum(paymentRes);
    console.log(isChecksumValid);
    res.cookie(
      'vnpay_code',
      isChecksumValid ? paymentRes.vnp_ResponseCode : '97',
    );
  }
}
