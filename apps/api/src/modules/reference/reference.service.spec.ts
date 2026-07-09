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
});
