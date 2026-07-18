import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class GoalEntryRowDto {
  @ApiProperty() @IsString() public tempId!: string;
  @ApiProperty() @IsInt() public year!: number;
  @ApiProperty() @IsInt() @Min(1) public month!: number;
  @ApiProperty() @IsNumber() @Min(0) public plannedAmount!: number;
  @ApiPropertyOptional() @IsNumber() @IsOptional() public actualAmount?: number | null;
}

export class ConfirmGoalsImportDto {
  @ApiProperty() @IsUUID() public goalId!: string;
  @ApiProperty({ type: [GoalEntryRowDto] })
  @IsArray() @ValidateNested({ each: true }) @Type(() => GoalEntryRowDto)
  public rows!: GoalEntryRowDto[];
}
