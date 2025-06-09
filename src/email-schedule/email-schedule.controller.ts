import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthenticationGuard } from '../authentication/jwt-authentication.guard';
import { EmailScheduleDto } from './email-schedule.dto';
import { EmailScheduleService } from './email-schedule.service';

@Controller('email-schedule')
export class EmailScheduleController {
  constructor(private readonly emailScheduleService: EmailScheduleService) {}

  @Post('schedule')
  @UseGuards(JwtAuthenticationGuard)
  async scheduleEmail(@Body() emailSchedule: EmailScheduleDto) {
    this.emailScheduleService.scheduleEmail(emailSchedule);
  }

  @Get('cancel')
  @UseGuards(JwtAuthenticationGuard)
  cancelAllScheduledEmails() {
    this.emailScheduleService.cancelAllScheduledEmails();
  }

  @Get('jobs')
  @UseGuards(JwtAuthenticationGuard)
  getAllJobs() {
    return this.emailScheduleService.getAllScheduledJobs();
  }
}
