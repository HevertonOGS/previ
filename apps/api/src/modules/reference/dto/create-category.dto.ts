import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum CategoryKindDto {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  BOTH = 'BOTH',
}

export class CreateCategoryDto {
  @ApiProperty({ example: 'Housing' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ enum: CategoryKindDto, default: CategoryKindDto.EXPENSE })
  @IsEnum(CategoryKindDto)
  @IsOptional()
  kind?: CategoryKindDto;
}
