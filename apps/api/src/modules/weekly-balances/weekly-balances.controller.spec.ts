import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyBalancesController } from './weekly-balances.controller';
import { WeeklyBalancesService } from './weekly-balances.service';

describe('WeeklyBalancesController', () => {
  let controller: WeeklyBalancesController;

  const mockService = {
    calculate: jest.fn(),
    findAllByPeriod: jest.fn(),
    findOne: jest.fn(),
    setBudget: jest.fn(),
    delete: jest.fn(),
  };

  const mockBalance = {
    id: 'wb-1',
    periodId: 'period-1',
    weekNumber: 1,
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-07'),
    budget: 800,
    totalSpent: 500,
    byTypeItems: [],
    byCategoryItems: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeklyBalancesController],
      providers: [{ provide: WeeklyBalancesService, useValue: mockService }],
    }).compile();

    controller = module.get<WeeklyBalancesController>(WeeklyBalancesController);
    jest.clearAllMocks();
  });

  it('should calculate and return a weekly balance', async () => {
    mockService.calculate.mockResolvedValue(mockBalance);

    const dto = {
      periodId: 'period-1',
      weekNumber: 1,
      startDate: '2026-07-01T00:00:00.000Z',
      endDate: '2026-07-07T23:59:59.999Z',
      budget: 800,
    };

    const result = await controller.calculate(dto);

    expect(result).toEqual(mockBalance);
    expect(mockService.calculate).toHaveBeenCalledWith(dto);
  });

  it('should return all weekly balances for a period', async () => {
    mockService.findAllByPeriod.mockResolvedValue([mockBalance]);

    const result = await controller.findAllByPeriod('period-1');

    expect(result).toEqual([mockBalance]);
    expect(mockService.findAllByPeriod).toHaveBeenCalledWith('period-1');
  });

  it('should return a weekly balance by id', async () => {
    mockService.findOne.mockResolvedValue(mockBalance);

    const result = await controller.findOne('wb-1');

    expect(result).toEqual(mockBalance);
    expect(mockService.findOne).toHaveBeenCalledWith('wb-1');
  });

  it('should update the budget', async () => {
    const updated = { ...mockBalance, budget: 1000 };
    mockService.setBudget.mockResolvedValue(updated);

    const result = await controller.setBudget('wb-1', { budget: 1000 });

    expect(result).toEqual(updated);
    expect(mockService.setBudget).toHaveBeenCalledWith('wb-1', 1000);
  });

  it('should delete a weekly balance', async () => {
    mockService.delete.mockResolvedValue(mockBalance);

    const result = await controller.delete('wb-1');

    expect(result).toEqual(mockBalance);
    expect(mockService.delete).toHaveBeenCalledWith('wb-1');
  });
});
