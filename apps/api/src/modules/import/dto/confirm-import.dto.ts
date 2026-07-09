import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
  IsOptional,
} from 'class-validator';

export class ParsedTransactionDto {
  @ApiProperty()
  @IsString()
  tempId!: string;

  @ApiProperty()
  @IsDateString()
  date!: string;

  @ApiProperty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  amount!: number;
}

export class ConfirmImportDto {
  @ApiProperty()
  @IsUUID()
  periodId!: string;

  @ApiProperty()
  @IsUUID()
  expenseTypeId!: string;

  @ApiProperty()
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ example: 'DEBIT' })
  @IsEnum(['DEBIT', 'CREDIT', 'PIX', 'CASH', 'BENEFITS', 'OTHER'])
  paymentMethod!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ type: [ParsedTransactionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParsedTransactionDto)
  transactions!: ParsedTransactionDto[];
}
