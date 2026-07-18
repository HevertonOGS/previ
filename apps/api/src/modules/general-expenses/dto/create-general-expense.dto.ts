import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateGeneralExpenseDto {
  @ApiProperty()
  @IsUUID()
  public periodId!: string;

  @ApiProperty()
  @IsUUID()
  public expenseTypeId!: string;

  @ApiProperty()
  @IsUUID()
  public categoryId!: string;

  @ApiProperty({ example: 'Rent' })
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiPropertyOptional({ example: 'Itaú' })
  @IsString()
  @IsOptional()
  public source?: string;

  @ApiProperty({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public estimatedAmount!: number;

  @ApiPropertyOptional({ example: 1500 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  public actualAmount?: number;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsString()
  @IsOptional()
  public expectedPayAt?: string;

  @ApiPropertyOptional({ example: '2026-07-10' })
  @IsString()
  @IsOptional()
  public paidAt?: string;

  @ApiPropertyOptional({ example: 'Estimado' })
  @IsString()
  @IsOptional()
  public status?: string;

  @ApiPropertyOptional({ example: 'PIX' })
  @IsString()
  @IsOptional()
  public paymentMethod?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public notes?: string;
}
