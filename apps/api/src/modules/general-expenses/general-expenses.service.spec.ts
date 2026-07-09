import { Test, TestingModule } from '@nestjs/testing';
import { GeneralExpensesService } from './general-expenses.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('GeneralExpensesService', () => {
  let service: GeneralExpensesService;

  const mockPrisma = {
    generalExpense: {
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
        GeneralExpensesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GeneralExpensesService>(GeneralExpensesService);
    jest.clearAllMocks();
  });

  const mockExpense = {
    id: 'ge-1', periodId: 'p-1', expenseTypeId: 'type-1',
    categoryId: 'cat-1', name: 'Rent', estimatedAmount: 1500, status: 'ESTIMATED',
  };

  it('should create a general expense', async () => {
    mockPrisma.generalExpense.create.mockResolvedValue(mockExpense);
    const result = await service.create({
      periodId: 'p-1', expenseTypeId: 'type-1', categoryId: 'cat-1',
      name: 'Rent', estimatedAmount: 1500,
    });
    expect(result).toEqual(mockExpense);
  });

  it('should return all general expenses', async () => {
    mockPrisma.generalExpense.findMany.mockResolvedValue([mockExpense]);
    const result = await service.findAll();
    expect(result).toEqual([mockExpense]);
  });

  it('should filter by periodId', async () => {
    mockPrisma.generalExpense.findMany.mockResolvedValue([mockExpense]);
    await service.findAll('p-1');
    expect(mockPrisma.generalExpense.findMany).toHaveBeenCalledWith({
      where: { periodId: 'p-1' },
      include: { expenseType: true, category: true },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return a general expense by id', async () => {
    mockPrisma.generalExpense.findUnique.mockResolvedValue(mockExpense);
    expect(await service.findOne('ge-1')).toEqual(mockExpense);
  });

  it('should update a general expense', async () => {
    mockPrisma.generalExpense.update.mockResolvedValue({ ...mockExpense, status: 'PAID' });
    const result = await service.update('ge-1', { status: 'PAID' as any });
    expect(result.status).toBe('PAID');
  });

  it('should delete a general expense', async () => {
    mockPrisma.generalExpense.delete.mockResolvedValue(mockExpense);
    expect(await service.remove('ge-1')).toEqual(mockExpense);
  });
});
