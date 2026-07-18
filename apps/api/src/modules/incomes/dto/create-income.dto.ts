import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateIncomeDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  public periodId!: string;

  @ApiProperty({ example: 'Salary' })
  @IsString()
  @IsNotEmpty()
  public name!: string;

  @ApiProperty({ example: 'Employment' })
  @IsString()
  @IsNotEmpty()
  public category!: string;

  @ApiPropertyOptional({ example: 'Nubank' })
  @IsString()
  @IsOptional()
  public source?: string;

  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  public expectedAmount!: number;

  @ApiPropertyOptional({ example: 5000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  public actualAmount?: number;

  @ApiPropertyOptional({ example: '2026-07-05' })
  @IsString()
  @IsOptional()
  public expectedReceiptAt?: string;

  @ApiPropertyOptional({ example: '2026-07-05' })
  @IsString()
  @IsOptional()
  public receivedAt?: string;

  @ApiPropertyOptional({ example: 'Pendente' })
  @IsString()
  @IsOptional()
  public status?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  public notes?: string;
}
