import { Test, TestingModule } from '@nestjs/testing';
import { ReferenceController } from './reference.controller';
import { ReferenceService } from './reference.service';

describe('ReferenceController', () => {
  let controller: ReferenceController;

  const mockService = {
    createCategory: jest.fn(),
    findAllCategories: jest.fn(),
    findCategoryById: jest.fn(),
    deleteCategory: jest.fn(),
    createExpenseType: jest.fn(),
    findAllExpenseTypes: jest.fn(),
    findExpenseTypeById: jest.fn(),
    deleteExpenseType: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReferenceController],
      providers: [{ provide: ReferenceService, useValue: mockService }],
    }).compile();

    controller = module.get<ReferenceController>(ReferenceController);
    jest.clearAllMocks();
  });

  describe('Categories', () => {
    const mockCategory = { id: 'cat-1', name: 'Housing', createdAt: new Date() };

    it('should create a category', async () => {
      mockService.createCategory.mockResolvedValue(mockCategory);

      const result = await controller.createCategory({ name: 'Housing' });

      expect(result).toEqual(mockCategory);
      expect(mockService.createCategory).toHaveBeenCalledWith({ name: 'Housing' });
    });

    it('should return all categories', async () => {
      mockService.findAllCategories.mockResolvedValue([mockCategory]);

      const result = await controller.findAllCategories();

      expect(result).toEqual([mockCategory]);
    });

    it('should return a category by id', async () => {
      mockService.findCategoryById.mockResolvedValue(mockCategory);

      const result = await controller.findCategoryById('cat-1');

      expect(result).toEqual(mockCategory);
    });

    it('should delete a category', async () => {
      mockService.deleteCategory.mockResolvedValue(mockCategory);

      const result = await controller.deleteCategory('cat-1');

      expect(result).toEqual(mockCategory);
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
      mockService.createExpenseType.mockResolvedValue(mockType);

      const result = await controller.createExpenseType({
        name: 'Fixed Costs',
        description: 'Recurring monthly obligations',
      });

      expect(result).toEqual(mockType);
    });

    it('should return all expense types', async () => {
      mockService.findAllExpenseTypes.mockResolvedValue([mockType]);

      const result = await controller.findAllExpenseTypes();

      expect(result).toEqual([mockType]);
    });

    it('should return an expense type by id', async () => {
      mockService.findExpenseTypeById.mockResolvedValue(mockType);

      const result = await controller.findExpenseTypeById('type-1');

      expect(result).toEqual(mockType);
    });

    it('should delete an expense type', async () => {
      mockService.deleteExpenseType.mockResolvedValue(mockType);

      const result = await controller.deleteExpenseType('type-1');

      expect(result).toEqual(mockType);
    });
  });
});
