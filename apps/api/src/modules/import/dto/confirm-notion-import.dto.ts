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
  @ApiProperty() @IsString() public tempId!: string;
  @ApiProperty() @IsString() public name!: string;
  @ApiProperty() @IsString() public category!: string;
  @ApiProperty() @IsNumber() @Min(0) public expectedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() public actualAmount?: number | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() public expectedReceiptAt?: string | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() public receivedAt?: string | null;
  @ApiProperty() @IsEnum(['PENDING', 'RECEIVED']) public status!: string;
}

export class ConfirmNotionIncomesDto {
  @ApiProperty() @IsUUID() public periodId!: string;
  @ApiProperty({ type: [NotionIncomeRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionIncomeRowDto)
  public rows!: NotionIncomeRowDto[];
}

export class NotionGeneralExpenseRowDto {
  @ApiProperty() @IsString() public tempId!: string;
  @ApiProperty() @IsString() public name!: string;
  @ApiProperty() @IsString() public expenseTypeName!: string;
  @ApiProperty() @IsString() public categoryName!: string;
  @ApiProperty() @IsNumber() @Min(0) public estimatedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() public actualAmount?: number | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() public expectedPayAt?: string | null;
  @ApiPropertyOptional() @IsDateString() @IsOptional() public paidAt?: string | null;
  @ApiProperty() @IsEnum(['ESTIMATED', 'PENDING', 'PAID']) public status!: string;
  @ApiPropertyOptional() @IsString() @IsOptional() public paymentMethodRaw?: string | null;
}

export class ConfirmNotionGeneralExpensesDto {
  @ApiProperty() @IsUUID() public periodId!: string;
  @ApiProperty({ type: [NotionGeneralExpenseRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionGeneralExpenseRowDto)
  public rows!: NotionGeneralExpenseRowDto[];
}

export class NotionCurrentExpenseRowDto {
  @ApiProperty() @IsString() public tempId!: string;
  @ApiProperty() @IsString() public name!: string;
  @ApiProperty() @IsString() public expenseTypeName!: string;
  @ApiProperty() @IsString() public categoryName!: string;
  @ApiProperty() @IsNumber() @Min(0) public amount!: number;
  @ApiProperty() @IsDateString() public paidAt!: string;
  @ApiProperty() @IsString() public paymentMethodRaw!: string;
}

export class ConfirmNotionCurrentExpensesDto {
  @ApiProperty() @IsUUID() public periodId!: string;
  @ApiProperty({ type: [NotionCurrentExpenseRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionCurrentExpenseRowDto)
  public rows!: NotionCurrentExpenseRowDto[];
}

export class NotionGoalEntryRowDto {
  @ApiProperty() @IsString() public tempId!: string;
  @ApiProperty() @IsInt() public year!: number;
  @ApiProperty() @IsInt() @Min(1) public month!: number;
  @ApiProperty() @IsNumber() @Min(0) public plannedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() public actualAmount?: number | null;
}

export class ConfirmNotionGoalsDto {
  @ApiProperty() @IsUUID() public goalId!: string;
  @ApiProperty({ type: [NotionGoalEntryRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => NotionGoalEntryRowDto)
  public rows!: NotionGoalEntryRowDto[];
}
