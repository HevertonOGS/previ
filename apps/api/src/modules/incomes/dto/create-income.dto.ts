import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  periodId!: string;

  @ApiProperty({ example: 'Salary' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'Employment' })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiPropertyOptional({ example: 'Nubank' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  expectedAmount!: number;

  @ApiPropertyOptional({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualAmount?: number;

  @ApiPropertyOptional({ example: '2026-07-05' })
  @IsString()
  @IsOptional()
  expectedReceiptAt?: string;

  @ApiPropertyOptional({ example: '2026-07-05' })
  @IsString()
  @IsOptional()
  receivedAt?: string;

  @ApiPropertyOptional({ example: 'Pendente' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
