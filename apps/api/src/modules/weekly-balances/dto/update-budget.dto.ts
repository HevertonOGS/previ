import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Min } from 'class-validator';

export class UpdateBudgetDto {
  @ApiProperty({ example: 900 })
  @IsNumber()
  @Min(0)
  budget: number;
}
