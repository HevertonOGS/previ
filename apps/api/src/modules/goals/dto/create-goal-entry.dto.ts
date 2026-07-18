import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateGoalEntryDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  public goalId!: string;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  public year!: number;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  public month!: number;

  @ApiProperty({ example: 500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public plannedAmount!: number;

  @ApiPropertyOptional({ example: 450 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  public actualAmount?: number;
}
