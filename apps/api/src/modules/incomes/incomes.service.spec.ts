import { Test, TestingModule } from '@nestjs/testing';
import { IncomesService } from './incomes.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('IncomesService', () => {
  let service: IncomesService;

  const mockPrisma = {
    income: {
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
        IncomesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<IncomesService>(IncomesService);
    jest.clearAllMocks();
  });

  const mockIncome = {
    id: 'inc-1', periodId: 'period-1', name: 'Salary',
    category: 'Employment', expectedAmount: 5000, status: 'PENDING',
  };

  it('should create an income', async () => {
    mockPrisma.income.create.mockResolvedValue(mockIncome);
    const result = await service.create({
      periodId: 'period-1', name: 'Salary', category: 'Employment', expectedAmount: 5000,
    });
    expect(result).toEqual(mockIncome);
  });

  it('should return all incomes', async () => {
    mockPrisma.income.findMany.mockResolvedValue([mockIncome]);
    const result = await service.findAll();
    expect(result).toEqual([mockIncome]);
  });

  it('should filter incomes by periodId', async () => {
    mockPrisma.income.findMany.mockResolvedValue([mockIncome]);
    await service.findAll('period-1');
    expect(mockPrisma.income.findMany).toHaveBeenCalledWith({
      where: { periodId: 'period-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('should return an income by id', async () => {
    mockPrisma.income.findUnique.mockResolvedValue(mockIncome);
    const result = await service.findOne('inc-1');
    expect(result).toEqual(mockIncome);
  });

  it('should update an income', async () => {
    mockPrisma.income.update.mockResolvedValue({ ...mockIncome, status: 'RECEIVED' });
    const result = await service.update('inc-1', { status: 'RECEIVED' as any });
    expect(result.status).toBe('RECEIVED');
  });

  it('should delete an income', async () => {
    mockPrisma.income.delete.mockResolvedValue(mockIncome);
    const result = await service.remove('inc-1');
    expect(result).toEqual(mockIncome);
  });
});
