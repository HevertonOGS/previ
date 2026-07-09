import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateExpenseTypeDto {
  @ApiProperty({ example: 'Fixed Costs' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Recurring monthly obligations' })
  @IsString()
  @IsOptional()
  description?: string;
}
