import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { VnpayPaymentService } from '../payment/vnpay/vnpay-payment.service';
import { AppConfigService } from '../../shared/services/app-config.service';
import { UPGRADE_USER_ORDER_INFO_PATTERN } from '../../common/utils/vnpay-util';
import { UserService } from './user.service';
import { VnPayPaymentResultDto } from '../payment/vnpay/dtos/vnpay-payment-result.dto';
import { UserFilterDto } from './dtos/user-filter.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { AdminRole } from '../../decorators/admin-role.decorator';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { UserDetailDto } from './dtos/user.dto';

@Controller('users')
@ApiTags('users')
@ApiExtraModels(UserDetailDto)
export class UserController {
  constructor(
    private readonly vnpayPaymentService: VnpayPaymentService,
    private readonly userService: UserService,
    private readonly appConfigService: AppConfigService,
  ) {}

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiOkResponse({
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginationDto) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(UserDetailDto) },
            },
          },
        },
      ],
    },
  })
  @AdminRole()
  async list(
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    filterDto: UserFilterDto,
  ) {
    return this.userService.list(filterDto);
  }

  @Post('request-vip-upgrade')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async requestUpgradeUser(@Req() req: Request, @Res() res: Response) {
    const redirectUrl = this.vnpayPaymentService.createPaymentUrl({
      amount: this.appConfigService.upgradeVipUserFee,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip,
      orderInfo: UPGRADE_USER_ORDER_INFO_PATTERN + req.user.id,
    });
    res.redirect(redirectUrl);
  }

  @Get('upgrade-callback/vnpay')
  handleVnpayCallback(
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    paymentRes: VnPayPaymentResultDto,
  ) {
    return this.vnpayPaymentService.processTransactionResult(
      paymentRes,
      this.userService.upgradeUserAfterVnpayPaymentSuccess,
    );
  }
}
