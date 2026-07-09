import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto, CreateExpenseTypeDto } from './dto';

@Injectable()
export class ReferenceService {
  constructor(private readonly prisma: PrismaService) {}

  createCategory(dto: CreateCategoryDto) {
    return this.prisma.category.create({ data: dto });
  }

  findAllCategories() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }

  findCategoryById(id: string) {
    return this.prisma.category.findUnique({ where: { id } });
  }

  deleteCategory(id: string) {
    return this.prisma.category.delete({ where: { id } });
  }

  createExpenseType(dto: CreateExpenseTypeDto) {
    return this.prisma.expenseType.create({ data: dto });
  }

  findAllExpenseTypes() {
    return this.prisma.expenseType.findMany({ orderBy: { name: 'asc' } });
  }

  findExpenseTypeById(id: string) {
    return this.prisma.expenseType.findUnique({ where: { id } });
  }

  deleteExpenseType(id: string) {
    return this.prisma.expenseType.delete({ where: { id } });
  }
}
