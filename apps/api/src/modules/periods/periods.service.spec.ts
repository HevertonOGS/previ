import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsService } from './periods.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('PeriodsService', () => {
  let service: PeriodsService;

  const mockPrisma = {
    period: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PeriodsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PeriodsService>(PeriodsService);
    jest.clearAllMocks();
  });

  const mockPeriod = { id: 'period-1', year: 2026, month: 7, createdAt: new Date() };

  it('should create a period', async () => {
    mockPrisma.period.create.mockResolvedValue(mockPeriod);
    const result = await service.create({ year: 2026, month: 7 });
    expect(result).toEqual(mockPeriod);
    expect(mockPrisma.period.create).toHaveBeenCalledWith({
      data: { year: 2026, month: 7 },
    });
  });

  it('should return all periods ordered by year and month descending', async () => {
    mockPrisma.period.findMany.mockResolvedValue([mockPeriod]);
    const result = await service.findAll();
    expect(result).toEqual([mockPeriod]);
    expect(mockPrisma.period.findMany).toHaveBeenCalledWith({
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  });

  it('should return a period by id with relations', async () => {
    mockPrisma.period.findUnique.mockResolvedValue(mockPeriod);
    const result = await service.findOne('period-1');
    expect(result).toEqual(mockPeriod);
    expect(mockPrisma.period.findUnique).toHaveBeenCalledWith({
      where: { id: 'period-1' },
      include: {
        incomes: true,
        generalExpenses: { include: { expenseType: true, category: true } },
        currentExpenses: { include: { expenseType: true, category: true } },
      },
    });
  });

  it('should delete a period', async () => {
    mockPrisma.period.delete.mockResolvedValue(mockPeriod);
    const result = await service.remove('period-1');
    expect(result).toEqual(mockPeriod);
  });
});
