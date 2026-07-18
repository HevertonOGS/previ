import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  Category,
  ExpenseStatusOption,
  ExpenseType,
  IncomeStatusOption,
  PaymentMethodOption,
  SourceOption,
} from '@prisma/client';
import { IsString, IsNotEmpty } from 'class-validator';

import { CreateCategoryDto, CreateExpenseTypeDto, CreateStatusOptionDto, UpdateStatusOptionDto } from './dto';
import { ReferenceService } from './reference.service';

class NameDto {
  @IsString()
  @IsNotEmpty()
  public name!: string;
}

@Controller('reference')
export class ReferenceController {
  public constructor(private readonly service: ReferenceService) {}

  // ── Categories ──────────────────────────────────

  @Post('categories')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Create a category' })
  public createCategory(@Body() dto: CreateCategoryDto): Promise<Category> {
    return this.service.createCategory(dto);
  }

  @Get('categories')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiQuery({ name: 'kind', required: false, enum: ['INCOME', 'EXPENSE', 'BOTH'] })
  public findAllCategories(@Query('kind') kind?: string): Promise<Category[]> {
    return this.service.findAllCategories(kind);
  }

  @Get('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Get a category by id' })
  public findCategoryById(@Param('id') id: string): Promise<Category | null> {
    return this.service.findCategoryById(id);
  }

  @Patch('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Update a category' })
  public updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto): Promise<Category> {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Delete a category' })
  public deleteCategory(@Param('id') id: string): Promise<Category> {
    return this.service.deleteCategory(id);
  }

  // ── Expense Types ──────────────────────────────

  @Post('expense-types')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Create an expense type' })
  public createExpenseType(@Body() dto: CreateExpenseTypeDto): Promise<ExpenseType> {
    return this.service.createExpenseType(dto);
  }

  @Get('expense-types')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'List all expense types' })
  public findAllExpenseTypes(): Promise<ExpenseType[]> {
    return this.service.findAllExpenseTypes();
  }

  @Get('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Get an expense type by id' })
  public findExpenseTypeById(@Param('id') id: string): Promise<ExpenseType | null> {
    return this.service.findExpenseTypeById(id);
  }

  @Patch('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Update an expense type' })
  public updateExpenseType(
    @Param('id') id: string,
    @Body() dto: CreateExpenseTypeDto,
  ): Promise<ExpenseType> {
    return this.service.updateExpenseType(id, dto);
  }

  @Delete('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Delete an expense type' })
  public deleteExpenseType(@Param('id') id: string): Promise<ExpenseType> {
    return this.service.deleteExpenseType(id);
  }

  // ── Income Status Options ───────────────────────

  @Get('income-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List income status options' })
  public findAllIncomeStatusOptions(): Promise<IncomeStatusOption[]> {
    return this.service.findAllIncomeStatusOptions();
  }

  @Post('income-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create an income status option' })
  public createIncomeStatusOption(@Body() dto: CreateStatusOptionDto): Promise<IncomeStatusOption> {
    return this.service.createIncomeStatusOption(dto);
  }

  @Patch('income-status-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Update an income status option' })
  public updateIncomeStatusOption(
    @Param('id') id: string,
    @Body() dto: UpdateStatusOptionDto,
  ): Promise<IncomeStatusOption> {
    return this.service.updateIncomeStatusOption(id, dto);
  }

  @Delete('income-status-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete an income status option' })
  public deleteIncomeStatusOption(@Param('id') id: string): Promise<IncomeStatusOption> {
    return this.service.deleteIncomeStatusOption(id);
  }

  // ── Expense Status Options ──────────────────────

  @Get('expense-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List expense status options' })
  public findAllExpenseStatusOptions(): Promise<ExpenseStatusOption[]> {
    return this.service.findAllExpenseStatusOptions();
  }

  @Post('expense-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create an expense status option' })
  public createExpenseStatusOption(
    @Body() dto: CreateStatusOptionDto,
  ): Promise<ExpenseStatusOption> {
    return this.service.createExpenseStatusOption(dto);
  }

  @Patch('expense-status-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Update an expense status option' })
  public updateExpenseStatusOption(
    @Param('id') id: string,
    @Body() dto: UpdateStatusOptionDto,
  ): Promise<ExpenseStatusOption> {
    return this.service.updateExpenseStatusOption(id, dto);
  }

  @Delete('expense-status-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete an expense status option' })
  public deleteExpenseStatusOption(@Param('id') id: string): Promise<ExpenseStatusOption> {
    return this.service.deleteExpenseStatusOption(id);
  }

  // ── Payment Method Options ──────────────────────

  @Get('payment-method-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List payment method options' })
  public findAllPaymentMethodOptions(): Promise<PaymentMethodOption[]> {
    return this.service.findAllPaymentMethodOptions();
  }

  @Post('payment-method-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create a payment method option' })
  @ApiBody({ type: NameDto })
  public createPaymentMethodOption(@Body() dto: NameDto): Promise<PaymentMethodOption> {
    return this.service.createPaymentMethodOption(dto.name);
  }

  @Delete('payment-method-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete a payment method option' })
  public deletePaymentMethodOption(@Param('id') id: string): Promise<PaymentMethodOption> {
    return this.service.deletePaymentMethodOption(id);
  }

  // ── Source Options ──────────────────────────────────────────────────

  @Get('source-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List source options (shared between incomes and expenses)' })
  public findAllSourceOptions(): Promise<SourceOption[]> {
    return this.service.findAllSourceOptions();
  }

  @Post('source-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create a source option' })
  @ApiBody({ type: NameDto })
  public createSourceOption(@Body() dto: NameDto): Promise<SourceOption> {
    return this.service.createSourceOption(dto.name);
  }

  @Delete('source-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete a source option' })
  public deleteSourceOption(@Param('id') id: string): Promise<SourceOption> {
    return this.service.deleteSourceOption(id);
  }
}
