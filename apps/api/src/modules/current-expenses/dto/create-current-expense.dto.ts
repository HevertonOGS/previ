import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCurrentExpenseDto {
  @ApiProperty()
  @IsUUID()
  periodId!: string;

  @ApiProperty()
  @IsUUID()
  expenseTypeId!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 'Grocery shopping' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Nubank' })
  @IsString()
  @IsOptional()
  source?: string;

  @ApiProperty({ example: 150.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  amount!: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  @IsString()
  paidAt!: string;

  @ApiProperty({ example: 'PIX' })
  @IsString()
  paymentMethod!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
