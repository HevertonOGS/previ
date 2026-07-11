import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateGoalEntryDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  goalId!: string;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  year!: number;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month!: number;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  plannedAmount!: number;

  @ApiPropertyOptional({ example: 450 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualAmount?: number;
}
