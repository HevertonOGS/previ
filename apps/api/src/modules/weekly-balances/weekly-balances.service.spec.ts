import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';

import { WeeklyBalancesService } from './weekly-balances.service';

describe('WeeklyBalancesService', () => {
  let service: WeeklyBalancesService;

  const startDate = new Date('2026-07-01T00:00:00.000Z');
  const endDate = new Date('2026-07-07T23:59:59.999Z');

  const mockWeeklyBalance = {
    id: 'wb-1',
    periodId: 'period-1',
    weekNumber: 1,
    startDate,
    endDate,
    budget: 800,
    totalSpent: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    byTypeItems: [],
    byCategoryItems: [],
  };

  const mockGeneralExpenses = [
    { actualAmount: 200, expenseTypeId: 'type-1', categoryId: 'cat-1' },
    { actualAmount: 150, expenseTypeId: 'type-2', categoryId: 'cat-2' },
  ];

  const mockCurrentExpenses = [
    { amount: 100, expenseTypeId: 'type-1', categoryId: 'cat-1' },
    { amount: 50, expenseTypeId: 'type-1', categoryId: 'cat-2' },
  ];

  const mockPrisma = {
    weeklyBalance: {
      upsert: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    weeklyBalanceByTypeItem: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    weeklyBalanceByCategoryItem: {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    },
    generalExpense: {
      findMany: jest.fn(),
    },
    currentExpense: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeeklyBalancesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<WeeklyBalancesService>(WeeklyBalancesService);
    jest.clearAllMocks();
  });

  describe('calculate', () => {
    it('should aggregate expenses and upsert the weekly balance', async () => {
      mockPrisma.generalExpense.findMany.mockResolvedValue(mockGeneralExpenses);
      mockPrisma.currentExpense.findMany.mockResolvedValue(mockCurrentExpenses);
      mockPrisma.weeklyBalance.upsert.mockResolvedValue(mockWeeklyBalance);
      mockPrisma.weeklyBalanceByTypeItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.weeklyBalanceByTypeItem.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.weeklyBalanceByCategoryItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.weeklyBalanceByCategoryItem.createMany.mockResolvedValue({ count: 2 });

      const result = await service.calculate({
        periodId: 'period-1',
        weekNumber: 1,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget: 800,
      });

      expect(result).toEqual(mockWeeklyBalance);

      // Should query expenses within the date range
      expect(mockPrisma.generalExpense.findMany).toHaveBeenCalledWith({
        where: {
          periodId: 'period-1',
          paidAt: { gte: expect.any(Date), lte: expect.any(Date) },
          status: 'PAID',
        },
        select: { actualAmount: true, expenseTypeId: true, categoryId: true },
      });

      expect(mockPrisma.currentExpense.findMany).toHaveBeenCalledWith({
        where: {
          periodId: 'period-1',
          paidAt: { gte: expect.any(Date), lte: expect.any(Date) },
        },
        select: { amount: true, expenseTypeId: true, categoryId: true },
      });

      // total = 200 + 150 + 100 + 50 = 500
      expect(mockPrisma.weeklyBalance.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { periodId_weekNumber: { periodId: 'period-1', weekNumber: 1 } },
          create: expect.objectContaining({ totalSpent: 500, budget: 800 }),
          update: expect.objectContaining({ totalSpent: 500 }),
        }),
      );
    });

    it('should group amounts by expenseType correctly', async () => {
      mockPrisma.generalExpense.findMany.mockResolvedValue(mockGeneralExpenses);
      mockPrisma.currentExpense.findMany.mockResolvedValue(mockCurrentExpenses);
      mockPrisma.weeklyBalance.upsert.mockResolvedValue({ ...mockWeeklyBalance, id: 'wb-1' });
      mockPrisma.weeklyBalanceByTypeItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.weeklyBalanceByCategoryItem.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.weeklyBalanceByTypeItem.createMany.mockResolvedValue({ count: 2 });
      mockPrisma.weeklyBalanceByCategoryItem.createMany.mockResolvedValue({ count: 2 });

      await service.calculate({
        periodId: 'period-1',
        weekNumber: 1,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        budget: 800,
      });

      // type-1: 200 (general) + 100 + 50 (current) = 350; type-2: 150
      expect(mockPrisma.weeklyBalanceByTypeItem.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          { weeklyBalanceId: 'wb-1', expenseTypeId: 'type-1', amount: 350 },
          { weeklyBalanceId: 'wb-1', expenseTypeId: 'type-2', amount: 150 },
        ]),
      });
    });
  });

  describe('findAllByPeriod', () => {
    it('should return all weekly balances for a period ordered by weekNumber', async () => {
      mockPrisma.weeklyBalance.findMany.mockResolvedValue([mockWeeklyBalance]);

      const result = await service.findAllByPeriod('period-1');

      expect(result).toEqual([mockWeeklyBalance]);
      expect(mockPrisma.weeklyBalance.findMany).toHaveBeenCalledWith({
        where: { periodId: 'period-1' },
        include: { byTypeItems: true, byCategoryItems: true },
        orderBy: { weekNumber: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a weekly balance with items', async () => {
      mockPrisma.weeklyBalance.findUnique.mockResolvedValue(mockWeeklyBalance);

      const result = await service.findOne('wb-1');

      expect(result).toEqual(mockWeeklyBalance);
      expect(mockPrisma.weeklyBalance.findUnique).toHaveBeenCalledWith({
        where: { id: 'wb-1' },
        include: { byTypeItems: true, byCategoryItems: true },
      });
    });
  });

  describe('setBudget', () => {
    it('should update the budget for a weekly balance', async () => {
      const updated = { ...mockWeeklyBalance, budget: 1000 };
      mockPrisma.weeklyBalance.update.mockResolvedValue(updated);

      const result = await service.setBudget('wb-1', 1000);

      expect(result).toEqual(updated);
      expect(mockPrisma.weeklyBalance.update).toHaveBeenCalledWith({
        where: { id: 'wb-1' },
        data: { budget: 1000 },
      });
    });
  });

  describe('delete', () => {
    it('should delete a weekly balance', async () => {
      mockPrisma.weeklyBalance.delete.mockResolvedValue(mockWeeklyBalance);

      const result = await service.delete('wb-1');

      expect(result).toEqual(mockWeeklyBalance);
      expect(mockPrisma.weeklyBalance.delete).toHaveBeenCalledWith({
        where: { id: 'wb-1' },
      });
    });
  });
});
