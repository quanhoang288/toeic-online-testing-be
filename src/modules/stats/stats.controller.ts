import {
  Controller,
  Get,
  Query,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AdminRole } from '../../decorators/admin-role.decorator';
import { StatsFilterDto } from './dtos/stats-filter.dto';
import { TodayStats } from './dtos/today-stats.dto';
import { StatsByDate } from './dtos/stats-by-date.dto';

@Controller('stats')
@ApiTags('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('today')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminRole()
  @ApiBearerAuth()
  @ApiOkResponse({ type: TodayStats })
  async getTodayStats() {
    return this.statsService.getTodayStats();
  }

  @Get('by-date')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminRole()
  @ApiBearerAuth()
  @ApiOkResponse({ type: StatsByDate })
  async getStatsByDate(
    @Query(
      new ValidationPipe({
        transformOptions: { enableImplicitConversion: true },
      }),
    )
    statsFilterDto: StatsFilterDto,
  ) {
    return this.statsService.getStatsByDate(
      statsFilterDto.from,
      statsFilterDto.to,
    );
  }
}
