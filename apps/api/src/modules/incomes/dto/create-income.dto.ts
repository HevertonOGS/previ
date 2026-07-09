import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum IncomeStatusDto {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
}

export class CreateIncomeDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  periodId: string;

  @ApiProperty({ example: 'Salary' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Employment' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  expectedAmount: number;

  @ApiPropertyOptional({ example: 5000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualAmount?: number;

  @ApiPropertyOptional({ example: '2026-07-05T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  expectedReceiptAt?: string;

  @ApiPropertyOptional({ example: '2026-07-05T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  receivedAt?: string;

  @ApiPropertyOptional({ enum: IncomeStatusDto, default: IncomeStatusDto.PENDING })
  @IsEnum(IncomeStatusDto)
  @IsOptional()
  status?: IncomeStatusDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
