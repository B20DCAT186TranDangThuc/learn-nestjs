import { Module } from '@nestjs/common';
import { EmailScheduleService } from './email-schedule.service';
import { EmailScheduleController } from './email-schedule.controller';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  providers: [EmailScheduleService],
  controllers: [EmailScheduleController]
})
export class EmailScheduleModule {}
