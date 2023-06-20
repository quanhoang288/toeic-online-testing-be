import { Injectable } from '@nestjs/common';
import moment from 'moment-timezone';
import querystring from 'qs';

import { AppConfigService } from '../../../shared/services/app-config.service';
import { VnPayCreatePaymentUrlRequestDto } from './dtos/vnpay-create-payment-url-request.dto';
import { PaymentType } from '../../../common/constants/payment-type';
import { Currency } from '../../../common/constants/currency';
import { TransactionService } from '../../../shared/services/transaction.service';
import { VnPayPaymentResultDto } from './dtos/vnpay-payment-result.dto';
import {
  extractUserIdFromOrderInfo,
  generateChecksum,
  sortObject,
} from '../../../common/utils/vnpay-util';
import { PaymentTransactionEntity } from '../../../database/entities/payment-transaction.entity';

@Injectable()
export class VnpayPaymentService {
  constructor(
    private readonly appConfigService: AppConfigService,
    private readonly transactionService: TransactionService,
  ) {}

  createPaymentUrl(
    createPaymentRequestDto: VnPayCreatePaymentUrlRequestDto,
  ): string {
    const {
      tmnCode,
      hashSecret,
      vnpayUrl,
      returnUrl,
      paymentUrlExpiresInMins,
    } = this.appConfigService.vnpayConfig;

    const now = new Date();

    let vnp_Params = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: createPaymentRequestDto.language || 'vn',
      vnp_CurrCode: Currency.VND,
      vnp_TxnRef: moment(now).format('HHmmss'),
      vnp_OrderInfo: createPaymentRequestDto.orderInfo,
      vnp_OrderType: 'other',
      vnp_Amount: createPaymentRequestDto.amount * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_ExpireDate: moment(now)
        .add(paymentUrlExpiresInMins, 'minutes')
        .format('YYYYMMDDHHmmss'),
      vnp_IpAddr: createPaymentRequestDto.ipAddress || '192.168.0.1',
      vnp_CreateDate: moment(now).format('YYYYMMDDHHmmss'),
    };

    const bankCode = createPaymentRequestDto.bankCode;
    if (bankCode) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);
    console.log('sorted: ', vnp_Params);

    vnp_Params['vnp_SecureHash'] = generateChecksum(
      querystring.stringify(vnp_Params, { encode: false }),
      hashSecret,
    );
    return (
      vnpayUrl + '?' + querystring.stringify(vnp_Params, { encode: false })
    );
  }

  verifyChecksum(txRes: VnPayPaymentResultDto): boolean {
    const secureHash = txRes.vnp_SecureHash;
    delete txRes.vnp_SecureHash;
    delete txRes.vnp_SecureHashType;

    const signed = generateChecksum(
      querystring.stringify(sortObject(txRes), { encode: false }),
      this.appConfigService.vnpayConfig.hashSecret,
    );
    return secureHash === signed;
  }

  async processTransactionResult(
    txRes: VnPayPaymentResultDto,
    onSuccessCallback?: any,
  ): Promise<any> {
    const secureHash = txRes.vnp_SecureHash;
    delete txRes.vnp_SecureHash;
    delete txRes.vnp_SecureHashType;

    const signed = generateChecksum(
      querystring.stringify(sortObject(txRes), { encode: false }),
      this.appConfigService.vnpayConfig.hashSecret,
    );

    let res: { RspCode: string; Message?: string };

    if (secureHash !== signed) {
      res = { RspCode: '97', Message: 'Fail checksum' };
    } else {
      await this.transactionService.runInTransaction(async (queryRunner) => {
        await queryRunner.manager.getRepository(PaymentTransactionEntity).save({
          transactionNo: txRes.vnp_TransactionNo,
          type: PaymentType.PAY,
          amount: txRes.vnp_Amount / 100,
          status: txRes.vnp_TransactionStatus,
          accountId: parseInt(extractUserIdFromOrderInfo(txRes.vnp_OrderInfo)),
          data: JSON.stringify(txRes),
        });
        const rspCode = txRes.vnp_ResponseCode;
        if (rspCode == '00') {
          res = { RspCode: '200', Message: 'Success' };
          if (onSuccessCallback) {
            await onSuccessCallback(txRes, queryRunner);
          }
        } else {
          res = { RspCode: rspCode };
        }
      });
    }

    return res;
  }
}
