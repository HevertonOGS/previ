import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { STATUS_COLORS, DEFAULT_STATUS_COLOR } from 'shared-types';

export class CreateStatusOptionDto {
  @ApiProperty({ example: 'Recebida' })
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiPropertyOptional({ enum: STATUS_COLORS, default: DEFAULT_STATUS_COLOR })
  @IsIn(STATUS_COLORS)
  @IsOptional()
  public color?: string;
}

export class UpdateStatusOptionDto {
  @ApiPropertyOptional({ example: 'Recebida' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  public name?: string;

  @ApiPropertyOptional({ enum: STATUS_COLORS })
  @IsIn(STATUS_COLORS)
  @IsOptional()
  public color?: string;
}
