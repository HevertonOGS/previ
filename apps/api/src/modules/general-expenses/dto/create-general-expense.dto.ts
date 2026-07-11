import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateGeneralExpenseDto {
  @ApiProperty()
  @IsUUID()
  periodId!: string;

  @ApiProperty()
  @IsUUID()
  expenseTypeId!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 'Rent' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Itaú' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedAmount!: number;

  @ApiPropertyOptional({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualAmount?: number;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsString()
  @IsOptional()
  expectedPayAt?: string;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsString()
  @IsOptional()
  paidAt?: string;

  @ApiPropertyOptional({ example: 'Estimado' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 'PIX' })
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
