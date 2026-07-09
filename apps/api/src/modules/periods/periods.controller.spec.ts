import { Test, TestingModule } from '@nestjs/testing';
import { PeriodsController } from './periods.controller';
import { PeriodsService } from './periods.service';

describe('PeriodsController', () => {
  let controller: PeriodsController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PeriodsController],
      providers: [{ provide: PeriodsService, useValue: mockService }],
    }).compile();

    controller = module.get<PeriodsController>(PeriodsController);
    jest.clearAllMocks();
  });

  const mockPeriod = { id: 'period-1', year: 2026, month: 7 };

  it('should create a period', async () => {
    mockService.create.mockResolvedValue(mockPeriod);
    expect(await controller.create({ year: 2026, month: 7 })).toEqual(mockPeriod);
  });

  it('should return all periods', async () => {
    mockService.findAll.mockResolvedValue([mockPeriod]);
    expect(await controller.findAll()).toEqual([mockPeriod]);
  });

  it('should return a period by id', async () => {
    mockService.findOne.mockResolvedValue(mockPeriod);
    expect(await controller.findOne('period-1')).toEqual(mockPeriod);
  });

  it('should delete a period', async () => {
    mockService.remove.mockResolvedValue(mockPeriod);
    expect(await controller.remove('period-1')).toEqual(mockPeriod);
  });
});
