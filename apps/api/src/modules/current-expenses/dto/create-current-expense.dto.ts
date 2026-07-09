import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaymentMethodDto } from '../../general-expenses/dto';

export class CreateCurrentExpenseDto {
  @ApiProperty()
  @IsUUID()
  periodId: string;

  @ApiProperty()
  @IsUUID()
  expenseTypeId: string;

  @ApiProperty()
  @IsUUID()
  categoryId: string;

  @ApiProperty({ example: 'Grocery shopping' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 150.5 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  @IsString()
  paidAt: string;

  @ApiProperty({ enum: PaymentMethodDto })
  @IsEnum(PaymentMethodDto)
  paymentMethod: PaymentMethodDto;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}
