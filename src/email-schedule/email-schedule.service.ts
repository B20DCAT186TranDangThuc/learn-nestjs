import { Injectable } from '@nestjs/common';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import EmailService from '../email/email.service';
import { EmailScheduleDto } from './email-schedule.dto';
import { CronJob } from 'cron';

@Injectable()
export class EmailScheduleService {
  constructor(
    private readonly emailService: EmailService,
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  scheduleEmail(emailSchedule: EmailScheduleDto) {
    const job = new CronJob(emailSchedule.cron, () => {
      this.emailService.sendMail({
        to: emailSchedule.recipient,
        subject: emailSchedule.subject,
        text: emailSchedule.content,
      });
    });

    this.schedulerRegistry.addCronJob(
      `${Date.now()}-${emailSchedule.subject}`,
      job,
    );
    job.start();
  }

  cancelAllScheduledEmails() {
    this.schedulerRegistry.getCronJobs().forEach((job) => job.stop());
  }

  getAllScheduledJobs(): { name: string; nextDate: Date | null }[] {
    const jobs = this.schedulerRegistry.getCronJobs();

    const result: { name: string; nextDate: Date | null }[] = [];

    jobs.forEach((job: CronJob, name: string) => {
      try {
        const next = job.nextDate()?.toJSDate() ?? null;
        result.push({
          name,
          nextDate: next,
        });
      } catch (error) {
        result.push({
          name,
          nextDate: null,
        });
      }
    });

    return result;
  }
}
