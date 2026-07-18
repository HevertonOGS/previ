import { Test, TestingModule } from '@nestjs/testing';

import { IncomesController } from './incomes.controller';
import { IncomesService } from './incomes.service';

describe('IncomesController', () => {
  let controller: IncomesController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncomesController],
      providers: [{ provide: IncomesService, useValue: mockService }],
    }).compile();

    controller = module.get<IncomesController>(IncomesController);
    jest.clearAllMocks();
  });

  const mockIncome = { id: 'inc-1', name: 'Salary', expectedAmount: 5000 };

  it('should create an income', async () => {
    mockService.create.mockResolvedValue(mockIncome);
    const result = await controller.create({
      periodId: 'p-1', name: 'Salary', category: 'Employment', expectedAmount: 5000,
    });
    expect(result).toEqual(mockIncome);
  });

  it('should return all incomes with optional periodId filter', async () => {
    mockService.findAll.mockResolvedValue([mockIncome]);
    expect(await controller.findAll('p-1')).toEqual([mockIncome]);
    expect(mockService.findAll).toHaveBeenCalledWith('p-1');
  });

  it('should return an income by id', async () => {
    mockService.findOne.mockResolvedValue(mockIncome);
    expect(await controller.findOne('inc-1')).toEqual(mockIncome);
  });

  it('should update an income', async () => {
    mockService.update.mockResolvedValue({ ...mockIncome, name: 'Updated' });
    const result = await controller.update('inc-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete an income', async () => {
    mockService.remove.mockResolvedValue(mockIncome);
    expect(await controller.remove('inc-1')).toEqual(mockIncome);
  });
});
