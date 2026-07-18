import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum GoalStatusDto {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  PAUSED = 'PAUSED',
}

export class CreateGoalDto {
  @ApiProperty({ example: 'Emergency Fund' })
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiProperty({ example: 10000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public targetAmount!: number;

  @ApiPropertyOptional({ example: '2026-12-31T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  public targetDate?: string;

  @ApiPropertyOptional({ enum: GoalStatusDto, default: GoalStatusDto.ACTIVE })
  @IsEnum(GoalStatusDto)
  @IsOptional()
  public status?: GoalStatusDto;

  @ApiPropertyOptional({ example: 'Build 6 months of expenses' })
  @IsString()
  @IsOptional()
  public notes?: string;
}
