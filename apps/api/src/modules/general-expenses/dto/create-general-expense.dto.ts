import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export enum ExpenseStatusDto {
  ESTIMATED = 'ESTIMATED',
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum PaymentMethodDto {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  PIX = 'PIX',
  CASH = 'CASH',
  BENEFITS = 'BENEFITS',
  OTHER = 'OTHER',
}

export class CreateGeneralExpenseDto {
  @ApiProperty()
  @IsUUID()
  periodId: string;

  @ApiProperty()
  @IsUUID()
  expenseTypeId: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Rent' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 1500 })
  @IsNumber()
  @Min(0)
  estimatedAmount: number;

  @ApiPropertyOptional({ example: 1500 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  actualAmount?: number;

  @ApiPropertyOptional({ example: '2026-07-10T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  expectedPayAt?: string;

  @ApiPropertyOptional({ example: '2026-07-10T00:00:00.000Z' })
  @IsString()
  @IsOptional()
  paidAt?: string;

  @ApiPropertyOptional({ enum: ExpenseStatusDto, default: ExpenseStatusDto.ESTIMATED })
  @IsEnum(ExpenseStatusDto)
  @IsOptional()
  status?: ExpenseStatusDto;

  @ApiPropertyOptional({ enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  @IsOptional()
  paymentMethod?: PaymentMethodDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
