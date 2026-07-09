import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateWeeklyBalanceDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  periodId: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  @Max(5)
  weekNumber: number;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ example: '2026-07-07T23:59:59.999Z' })
  @IsDateString()
  endDate: string;

  @ApiProperty({ example: 800 })
  @IsNumber()
  @Min(0)
  budget: number;
}
