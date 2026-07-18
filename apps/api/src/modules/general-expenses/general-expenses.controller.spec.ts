import { Test, TestingModule } from '@nestjs/testing';

import { GeneralExpensesController } from './general-expenses.controller';
import { GeneralExpensesService } from './general-expenses.service';

describe('GeneralExpensesController', () => {
  let controller: GeneralExpensesController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GeneralExpensesController],
      providers: [{ provide: GeneralExpensesService, useValue: mockService }],
    }).compile();

    controller = module.get<GeneralExpensesController>(GeneralExpensesController);
    jest.clearAllMocks();
  });

  const mockExpense = { id: 'ge-1', name: 'Rent', estimatedAmount: 1500 };

  it('should create a general expense', async () => {
    mockService.create.mockResolvedValue(mockExpense);
    const result = await controller.create({
      periodId: 'p-1', expenseTypeId: 't-1', categoryId: 'c-1',
      name: 'Rent', estimatedAmount: 1500,
    });
    expect(result).toEqual(mockExpense);
  });

  it('should return all with optional periodId filter', async () => {
    mockService.findAll.mockResolvedValue([mockExpense]);
    expect(await controller.findAll('p-1')).toEqual([mockExpense]);
    expect(mockService.findAll).toHaveBeenCalledWith('p-1');
  });

  it('should return one by id', async () => {
    mockService.findOne.mockResolvedValue(mockExpense);
    expect(await controller.findOne('ge-1')).toEqual(mockExpense);
  });

  it('should update', async () => {
    mockService.update.mockResolvedValue({ ...mockExpense, status: 'PAID' });
    const result = await controller.update('ge-1', { status: 'PAID' });
    expect(result.status).toBe('PAID');
  });

  it('should delete', async () => {
    mockService.remove.mockResolvedValue(mockExpense);
    expect(await controller.remove('ge-1')).toEqual(mockExpense);
  });
});
