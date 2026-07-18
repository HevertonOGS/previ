import { Test, TestingModule } from '@nestjs/testing';

import { CurrentExpensesController } from './current-expenses.controller';
import { CurrentExpensesService } from './current-expenses.service';

describe('CurrentExpensesController', () => {
  let controller: CurrentExpensesController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CurrentExpensesController],
      providers: [{ provide: CurrentExpensesService, useValue: mockService }],
    }).compile();

    controller = module.get<CurrentExpensesController>(CurrentExpensesController);
    jest.clearAllMocks();
  });

  const mockExpense = { id: 'ce-1', name: 'Groceries', amount: 150 };

  it('should create', async () => {
    mockService.create.mockResolvedValue(mockExpense);
    const result = await controller.create({
      periodId: 'p-1', expenseTypeId: 't-1', categoryId: 'c-1',
      name: 'Groceries', amount: 150, paidAt: '2026-07-05', paymentMethod: 'DEBIT',
    });
    expect(result).toEqual(mockExpense);
  });

  it('should return all with optional periodId', async () => {
    mockService.findAll.mockResolvedValue([mockExpense]);
    expect(await controller.findAll('p-1')).toEqual([mockExpense]);
    expect(mockService.findAll).toHaveBeenCalledWith('p-1');
  });

  it('should return one by id', async () => {
    mockService.findOne.mockResolvedValue(mockExpense);
    expect(await controller.findOne('ce-1')).toEqual(mockExpense);
  });

  it('should update', async () => {
    mockService.update.mockResolvedValue({ ...mockExpense, amount: 200 });
    expect((await controller.update('ce-1', { amount: 200 })).amount).toBe(200);
  });

  it('should delete', async () => {
    mockService.remove.mockResolvedValue(mockExpense);
    expect(await controller.remove('ce-1')).toEqual(mockExpense);
  });
});
