import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class NotionIncomeRowDto {
  @ApiProperty() @IsString() tempId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() category!: string;
  @ApiProperty() @IsNumber() @Min(0) expectedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() actualAmount?: number | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() expectedReceiptAt?: string | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() receivedAt?: string | null;
  @ApiProperty() @IsEnum(['PENDING', 'RECEIVED']) status!: string;
}

export class ConfirmNotionIncomesDto {
  @ApiProperty() @IsUUID() periodId!: string;
  @ApiProperty({ type: [NotionIncomeRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionIncomeRowDto)
  rows!: NotionIncomeRowDto[];
}

export class NotionGeneralExpenseRowDto {
  @ApiProperty() @IsString() tempId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() expenseTypeName!: string;
  @ApiProperty() @IsString() categoryName!: string;
  @ApiProperty() @IsNumber() @Min(0) estimatedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() actualAmount?: number | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() expectedPayAt?: string | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() paidAt?: string | null;
  @ApiProperty() @IsEnum(['ESTIMATED', 'PENDING', 'PAID']) status!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() paymentMethodRaw?: string | null;
}

export class ConfirmNotionGeneralExpensesDto {
  @ApiProperty() @IsUUID() periodId!: string;
  @ApiProperty({ type: [NotionGeneralExpenseRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionGeneralExpenseRowDto)
  rows!: NotionGeneralExpenseRowDto[];
}

export class NotionCurrentExpenseRowDto {
  @ApiProperty() @IsString() tempId!: string;
  @ApiProperty() @IsString() name!: string;
  @ApiProperty() @IsString() expenseTypeName!: string;
  @ApiProperty() @IsString() categoryName!: string;
  @ApiProperty() @IsNumber() @Min(0) amount!: number;
  @ApiProperty() @IsDateString() paidAt!: string;
  @ApiProperty() @IsString() paymentMethodRaw!: string;
}

export class ConfirmNotionCurrentExpensesDto {
  @ApiProperty() @IsUUID() periodId!: string;
  @ApiProperty({ type: [NotionCurrentExpenseRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionCurrentExpenseRowDto)
  rows!: NotionCurrentExpenseRowDto[];
}

export class NotionGoalEntryRowDto {
  @ApiProperty() @IsString() tempId!: string;
  @ApiProperty() @IsInt() year!: number;
  @ApiProperty() @IsInt() @Min(1) month!: number;
  @ApiProperty() @IsNumber() @Min(0) plannedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() actualAmount?: number | null;
}

export class ConfirmNotionGoalsDto {
  @ApiProperty() @IsUUID() goalId!: string;
  @ApiProperty({ type: [NotionGoalEntryRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionGoalEntryRowDto)
  rows!: NotionGoalEntryRowDto[];
}
