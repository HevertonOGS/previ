import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsIn, IsObject, IsString, IsUUID, ValidateNested } from 'class-validator';

import type { ImportEntityType } from 'shared-types';

const IMPORT_ENTITY_TYPES: ImportEntityType[] = ['income', 'general-expense', 'current-expense'];

export class SpreadsheetRowDto {
  @ApiProperty()
  @IsString()
  public tempId!: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string' } })
  @IsObject()
  public raw!: Record<string, string>;
}

export class ConfirmSpreadsheetImportDto {
  @ApiProperty({ enum: IMPORT_ENTITY_TYPES })
  @IsIn(IMPORT_ENTITY_TYPES)
  public entityType!: ImportEntityType;

  @ApiProperty()
  @IsUUID()
  public periodId!: string;

  @ApiProperty({ type: 'object', additionalProperties: { type: 'string', nullable: true } })
  @IsObject()
  public mapping!: Record<string, string | null>;

  @ApiProperty({ type: [SpreadsheetRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpreadsheetRowDto)
  public rows!: SpreadsheetRowDto[];
}
