import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReferenceService } from './reference.service';
import { CreateCategoryDto, CreateExpenseTypeDto } from './dto';

@Controller('reference')
export class ReferenceController {
  constructor(private readonly service: ReferenceService) {}

  // ── Categories ──────────────────────────────────

  @Post('categories')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Create a category' })
  createCategory(@Body() dto: CreateCategoryDto) {
    return this.service.createCategory(dto);
  }

  @Get('categories')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'List all categories' })
  findAllCategories() {
    return this.service.findAllCategories();
  }

  @Get('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Get a category by id' })
  findCategoryById(@Param('id') id: string) {
    return this.service.findCategoryById(id);
  }

  @Delete('categories/:id')
  @ApiTags('Categories')
  @ApiOperation({ summary: 'Delete a category' })
  deleteCategory(@Param('id') id: string) {
    return this.service.deleteCategory(id);
  }

  // ── Expense Types ──────────────────────────────

  @Post('expense-types')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Create an expense type' })
  createExpenseType(@Body() dto: CreateExpenseTypeDto) {
    return this.service.createExpenseType(dto);
  }

  @Get('expense-types')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'List all expense types' })
  findAllExpenseTypes() {
    return this.service.findAllExpenseTypes();
  }

  @Get('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Get an expense type by id' })
  findExpenseTypeById(@Param('id') id: string) {
    return this.service.findExpenseTypeById(id);
  }

  @Delete('expense-types/:id')
  @ApiTags('Expense Types')
  @ApiOperation({ summary: 'Delete an expense type' })
  deleteExpenseType(@Param('id') id: string) {
    return this.service.deleteExpenseType(id);
  }
}
