import { Test, TestingModule } from '@nestjs/testing';
import { CurrentExpensesService } from './current-expenses.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('CurrentExpensesService', () => {
  let service: CurrentExpensesService;

  const mockPrisma = {
    currentExpense: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CurrentExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CurrentExpensesService>(CurrentExpensesService);
    jest.clearAllMocks();
  });

  const mockExpense = {
    id: 'ce-1', periodId: 'p-1', expenseTypeId: 'type-1',
    categoryId: 'cat-1', name: 'Groceries', amount: 150, paymentMethod: 'DEBIT',
  };

  it('should create a current expense', async () => {
    mockPrisma.currentExpense.create.mockResolvedValue(mockExpense);
    const result = await service.create({
      periodId: 'p-1', expenseTypeId: 'type-1', categoryId: 'cat-1',
      name: 'Groceries', amount: 150, paidAt: '2026-07-05', paymentMethod: 'DEBIT' as any,
    });
    expect(result).toEqual(mockExpense);
  });

  it('should return all current expenses', async () => {
    mockPrisma.currentExpense.findMany.mockResolvedValue([mockExpense]);
    expect(await service.findAll()).toEqual([mockExpense]);
  });

  it('should filter by periodId', async () => {
    mockPrisma.currentExpense.findMany.mockResolvedValue([mockExpense]);
    await service.findAll('p-1');
    expect(mockPrisma.currentExpense.findMany).toHaveBeenCalledWith({
      where: { periodId: 'p-1' },
      include: { expenseType: true, category: true },
      orderBy: { paidAt: 'desc' },
    });
  });

  it('should return one by id', async () => {
    mockPrisma.currentExpense.findUnique.mockResolvedValue(mockExpense);
    expect(await service.findOne('ce-1')).toEqual(mockExpense);
  });

  it('should update', async () => {
    mockPrisma.currentExpense.update.mockResolvedValue({ ...mockExpense, amount: 200 });
    const result = await service.update('ce-1', { amount: 200 });
    expect(result.amount).toBe(200);
  });

  it('should delete', async () => {
    mockPrisma.currentExpense.delete.mockResolvedValue(mockExpense);
    expect(await service.remove('ce-1')).toEqual(mockExpense);
  });
});
