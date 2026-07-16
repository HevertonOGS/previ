import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceService } from './reference.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('ReferenceService', () => {
  let service: ReferenceService;
  let prisma: PrismaService;

  const mockPrisma = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    expenseType: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    incomeStatusOption: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    expenseStatusOption: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReferenceService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReferenceService>(ReferenceService);
    prisma = module.get<PrismaService>(PrismaService);
    jest.clearAllMocks();
  });

  describe('Categories', () => {
    const mockCategory = { id: 'cat-1', name: 'Housing', createdAt: new Date() };

    it('should create a category', async () => {
      mockPrisma.category.create.mockResolvedValue(mockCategory);

      const result = await service.createCategory({ name: 'Housing' });

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.create).toHaveBeenCalledWith({
        data: { name: 'Housing' },
      });
    });

    it('should return all categories', async () => {
      mockPrisma.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAllCategories();

      expect(result).toEqual([mockCategory]);
      expect(mockPrisma.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return a category by id', async () => {
      mockPrisma.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findCategoryById('cat-1');

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.findUnique).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });

    it('should delete a category', async () => {
      mockPrisma.category.delete.mockResolvedValue(mockCategory);

      const result = await service.deleteCategory('cat-1');

      expect(result).toEqual(mockCategory);
      expect(mockPrisma.category.delete).toHaveBeenCalledWith({
        where: { id: 'cat-1' },
      });
    });
  });

  describe('ExpenseTypes', () => {
    const mockType = {
      id: 'type-1',
      name: 'Fixed Costs',
      description: 'Recurring monthly obligations',
      createdAt: new Date(),
    };

    it('should create an expense type', async () => {
      mockPrisma.expenseType.create.mockResolvedValue(mockType);

      const result = await service.createExpenseType({
        name: 'Fixed Costs',
        description: 'Recurring monthly obligations',
      });

      expect(result).toEqual(mockType);
      expect(mockPrisma.expenseType.create).toHaveBeenCalledWith({
        data: { name: 'Fixed Costs', description: 'Recurring monthly obligations' },
      });
    });

    it('should return all expense types', async () => {
      mockPrisma.expenseType.findMany.mockResolvedValue([mockType]);

      const result = await service.findAllExpenseTypes();

      expect(result).toEqual([mockType]);
      expect(mockPrisma.expenseType.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should return an expense type by id', async () => {
      mockPrisma.expenseType.findUnique.mockResolvedValue(mockType);

      const result = await service.findExpenseTypeById('type-1');

      expect(result).toEqual(mockType);
      expect(mockPrisma.expenseType.findUnique).toHaveBeenCalledWith({
        where: { id: 'type-1' },
      });
    });

    it('should delete an expense type', async () => {
      mockPrisma.expenseType.delete.mockResolvedValue(mockType);

      const result = await service.deleteExpenseType('type-1');

      expect(result).toEqual(mockType);
      expect(mockPrisma.expenseType.delete).toHaveBeenCalledWith({
        where: { id: 'type-1' },
      });
    });
  });

  describe('IncomeStatusOptions', () => {
    const mockOption = { id: 'inc-status-1', name: 'Recebida', color: 'success', createdAt: new Date() };

    it('should create an income status option with a color', async () => {
      mockPrisma.incomeStatusOption.create.mockResolvedValue(mockOption);

      const result = await service.createIncomeStatusOption({ name: 'Recebida', color: 'success' });

      expect(result).toEqual(mockOption);
      expect(mockPrisma.incomeStatusOption.create).toHaveBeenCalledWith({
        data: { id: expect.any(String), name: 'Recebida', color: 'success' },
      });
    });

    it('should return all income status options', async () => {
      mockPrisma.incomeStatusOption.findMany.mockResolvedValue([mockOption]);

      const result = await service.findAllIncomeStatusOptions();

      expect(result).toEqual([mockOption]);
      expect(mockPrisma.incomeStatusOption.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should update an income status option', async () => {
      const updated = { ...mockOption, name: 'Confirmada', color: 'info' };
      mockPrisma.incomeStatusOption.update.mockResolvedValue(updated);

      const result = await service.updateIncomeStatusOption('inc-status-1', { name: 'Confirmada', color: 'info' });

      expect(result).toEqual(updated);
      expect(mockPrisma.incomeStatusOption.update).toHaveBeenCalledWith({
        where: { id: 'inc-status-1' },
        data: { name: 'Confirmada', color: 'info' },
      });
    });

    it('should delete an income status option', async () => {
      mockPrisma.incomeStatusOption.delete.mockResolvedValue(mockOption);

      const result = await service.deleteIncomeStatusOption('inc-status-1');

      expect(result).toEqual(mockOption);
      expect(mockPrisma.incomeStatusOption.delete).toHaveBeenCalledWith({
        where: { id: 'inc-status-1' },
      });
    });
  });

  describe('ExpenseStatusOptions', () => {
    const mockOption = { id: 'exp-status-1', name: 'Pago', color: 'success', createdAt: new Date() };

    it('should create an expense status option with a color', async () => {
      mockPrisma.expenseStatusOption.create.mockResolvedValue(mockOption);

      const result = await service.createExpenseStatusOption({ name: 'Pago', color: 'success' });

      expect(result).toEqual(mockOption);
      expect(mockPrisma.expenseStatusOption.create).toHaveBeenCalledWith({
        data: { id: expect.any(String), name: 'Pago', color: 'success' },
      });
    });

    it('should return all expense status options', async () => {
      mockPrisma.expenseStatusOption.findMany.mockResolvedValue([mockOption]);

      const result = await service.findAllExpenseStatusOptions();

      expect(result).toEqual([mockOption]);
      expect(mockPrisma.expenseStatusOption.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });

    it('should update an expense status option', async () => {
      const updated = { ...mockOption, color: 'warning' };
      mockPrisma.expenseStatusOption.update.mockResolvedValue(updated);

      const result = await service.updateExpenseStatusOption('exp-status-1', { color: 'warning' });

      expect(result).toEqual(updated);
      expect(mockPrisma.expenseStatusOption.update).toHaveBeenCalledWith({
        where: { id: 'exp-status-1' },
        data: { color: 'warning' },
      });
    });

    it('should delete an expense status option', async () => {
      mockPrisma.expenseStatusOption.delete.mockResolvedValue(mockOption);

      const result = await service.deleteExpenseStatusOption('exp-status-1');

      expect(result).toEqual(mockOption);
      expect(mockPrisma.expenseStatusOption.delete).toHaveBeenCalledWith({
        where: { id: 'exp-status-1' },
      });
    });
  });
});
