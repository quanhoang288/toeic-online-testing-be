import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';
import { VnpayPaymentService } from '../payment/vnpay/vnpay-payment.service';
import { AppConfigService } from '../../shared/services/app-config.service';
import { UPGRADE_USER_ORDER_INFO_PATTERN } from '../../common/utils/vnpay-util';
import { UserService } from './user.service';
import { VnPayPaymentResultDto } from '../payment/vnpay/dtos/vnpay-payment-result.dto';
import { UserFilterDto } from './dtos/user-filter.dto';
import { RolesGuard } from '../../guards/roles.guard';
import { PaginationDto } from '../../common/dtos/pagination.dto';
import { UserDetailDto, UserDto } from './dtos/user.dto';
import { AllowedRoles } from '../../decorators/allowed-role.decorator';
import { Role } from '../../common/constants/role';
import { ApiResponseDto } from '../../common/dtos/api-response.dto';

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
  @AllowedRoles([Role.ADMIN, Role.VIP_USER])
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

  @Post('admin')
  @ApiBearerAuth()
  @ApiCreatedResponse({ type: ApiResponseDto })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AllowedRoles([Role.SUPER_ADMIN])
  @ApiBody({ type: UserDto })
  async createAdmin(@Body() adminDto: UserDto) {
    await this.userService.createAdmin(adminDto);
    return { message: 'Create admin user successfully' };
  }

  @Get('request-vip-upgrade')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async requestUpgradeUser(@Req() req: Request) {
    const redirectUrl = this.vnpayPaymentService.createPaymentUrl({
      amount: this.appConfigService.upgradeVipUserFee,
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip,
      orderInfo: UPGRADE_USER_ORDER_INFO_PATTERN + req.user.id,
    });
    return { redirectUrl };
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
