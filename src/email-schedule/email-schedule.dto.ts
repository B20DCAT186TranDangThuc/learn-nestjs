import { IsDateString, IsEmail, IsNotEmpty, IsString, Matches } from 'class-validator';

export class EmailScheduleDto {
  @IsEmail()
  recipient: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  content: string;

  // @IsDateString()
  // date: string;
  @IsString()
  @Matches(/^(\*|[0-5]?\d) (\*|[0-5]?\d) (\*|[01]?\d|2[0-3]) (\*|[1-9]|[12]\d|3[01]) (\*|1[0-2]|[1-9]) (\*|[0-6])$/, {
    message: 'cron expression không hợp lệ',
  })
  cron: string;
}
