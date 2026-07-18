import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class CreateWeeklyBalanceDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  public periodId!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  public weekNumber!: number;

  @ApiProperty({ example: '2026-07-01T00:00:00.000Z' })
  @IsDateString()
  public startDate!: string;

  @ApiProperty({ example: '2026-07-07T23:59:59.999Z' })
  @IsDateString()
  public endDate!: string;

  @ApiProperty({ example: 800 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public budget!: number;
}
