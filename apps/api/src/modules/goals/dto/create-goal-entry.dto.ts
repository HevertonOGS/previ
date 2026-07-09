import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateGoalEntryDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  goalId: string;

  @ApiProperty({ example: 2026 })
  @IsInt()
  @Min(2020)
  @Max(2100)
  year: number;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  plannedAmount: number;

  @ApiPropertyOptional({ example: 450 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualAmount?: number;
}
