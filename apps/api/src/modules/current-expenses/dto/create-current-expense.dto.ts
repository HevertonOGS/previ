import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCurrentExpenseDto {
  @ApiProperty()
  @IsUUID()
  public periodId!: string;

  @ApiProperty()
  @IsUUID()
  public expenseTypeId!: string;

  @ApiProperty()
  @IsUUID()
  public categoryId!: string;

  @ApiProperty({ example: 'Grocery shopping' })
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiPropertyOptional({ example: 'Nubank' })
  @IsString()
  @IsOptional()
  public source?: string;

  @ApiProperty({ example: 150.5 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public amount!: number;

  @ApiProperty({ example: '2026-07-05T00:00:00.000Z' })
  @IsString()
  public paidAt!: string;

  @ApiProperty({ example: 'PIX' })
  @IsString()
  public paymentMethod!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public notes?: string;
}
