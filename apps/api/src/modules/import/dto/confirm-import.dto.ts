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
  public tempId!: string;

  @ApiProperty()
  @IsDateString()
  public date!: string;

  @ApiProperty()
  @IsString()
  public description!: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  public amount!: number;
}

export class ConfirmImportDto {
  @ApiProperty()
  @IsUUID()
  public periodId!: string;

  @ApiProperty()
  @IsUUID()
  public expenseTypeId!: string;

  @ApiProperty()
  @IsUUID()
  public categoryId!: string;

  @ApiProperty({ example: 'DEBIT' })
  @IsEnum(['DEBIT', 'CREDIT', 'PIX', 'CASH', 'BENEFITS', 'OTHER'])
  public paymentMethod!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public notes?: string;

  @ApiProperty({ type: [ParsedTransactionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParsedTransactionDto)
  public transactions!: ParsedTransactionDto[];
}
