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
import { IsString, IsNotEmpty } from 'class-validator';
import { ReferenceService } from './reference.service';
import { CreateCategoryDto, CreateExpenseTypeDto } from './dto';

class NameDto { @IsString() @IsNotEmpty() name!: string; }

@Controller('reference')
export class ReferenceController {
  public constructor(private readonly service: ReferenceService) {}

  // ── Categories ──────────────────────────────────

  @Post('categories')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Create a category' })
  public createCategory(@Body() dto: CreateCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Get('categories')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'List all categories' })
  @ApiQuery({ name: 'kind', required: false, enum: ['INCOME', 'EXPENSE', 'BOTH'] })
  public findAllCategories(@Query('kind') kind?: string) {
    return this.service.findAllCategories(kind);
  }

  @Get('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Get a category by id' })
  public findCategoryById(@Param('id') id: string) {
    return this.service.findCategoryById(id);
  }

  @Patch('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Update a category' })
  public updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.service.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Delete a category' })
  public deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(id);
  }

  // ── Expense Types ──────────────────────────────

  @Post('expense-types')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Create an expense type' })
  public createExpenseType(@Body() dto: CreateExpenseTypeDto) {
    return this.service.createExpenseType(dto);
  }

  @Get('expense-types')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'List all expense types' })
  public findAllExpenseTypes() {
    return this.service.findAllExpenseTypes();
  }

  @Get('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Get an expense type by id' })
  public findExpenseTypeById(@Param('id') id: string) {
    return this.service.findExpenseTypeById(id);
  }

  @Patch('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Update an expense type' })
  public updateExpenseType(@Param('id') id: string, @Body() dto: CreateExpenseTypeDto) {
    return this.service.updateExpenseType(id, dto);
  }

  @Delete('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Delete an expense type' })
  public deleteExpenseType(@Param('id') id: string) {
    return this.service.deleteExpenseType(id);
  }

  // ── Income Status Options ───────────────────────

  @Get('income-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List income status options' })
  public findAllIncomeStatusOptions() {
    return this.service.findAllIncomeStatusOptions();
  }

  @Post('income-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create an income status option' })
  @ApiBody({ type: NameDto })
  public createIncomeStatusOption(@Body() dto: NameDto) {
    return this.service.createIncomeStatusOption(dto.name);
  }

  @Delete('income-status-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete an income status option' })
  public deleteIncomeStatusOption(@Param('id') id: string) {
    return this.service.deleteIncomeStatusOption(id);
  }

  // ── Expense Status Options ──────────────────────

  @Get('expense-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List expense status options' })
  public findAllExpenseStatusOptions() {
    return this.service.findAllExpenseStatusOptions();
  }

  @Post('expense-status-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create an expense status option' })
  @ApiBody({ type: NameDto })
  public createExpenseStatusOption(@Body() dto: NameDto) {
    return this.service.createExpenseStatusOption(dto.name);
  }

  @Delete('expense-status-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete an expense status option' })
  public deleteExpenseStatusOption(@Param('id') id: string) {
    return this.service.deleteExpenseStatusOption(id);
  }

  // ── Payment Method Options ──────────────────────

  @Get('payment-method-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List payment method options' })
  public findAllPaymentMethodOptions() {
    return this.service.findAllPaymentMethodOptions();
  }

  @Post('payment-method-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create a payment method option' })
  @ApiBody({ type: NameDto })
  public createPaymentMethodOption(@Body() dto: NameDto) {
    return this.service.createPaymentMethodOption(dto.name);
  }

  @Delete('payment-method-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete a payment method option' })
  public deletePaymentMethodOption(@Param('id') id: string) {
    return this.service.deletePaymentMethodOption(id);
  }

  // ── Source Options ──────────────────────────────────────────────────

  @Get('source-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'List source options (shared between incomes and expenses)' })
  public findAllSourceOptions() {
    return this.service.findAllSourceOptions();
  }

  @Post('source-options')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Create a source option' })
  @ApiBody({ type: NameDto })
  public createSourceOption(@Body() dto: NameDto) {
    return this.service.createSourceOption(dto.name);
  }

  @Delete('source-options/:id')
  @ApiTags('Options')
  @ApiOperation({ summary: 'Delete a source option' })
  public deleteSourceOption(@Param('id') id: string) {
    return this.service.deleteSourceOption(id);
  }
}
