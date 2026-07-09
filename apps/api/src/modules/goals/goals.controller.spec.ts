import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

describe('GoalsController', () => {
  let controller: GoalsController;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createEntry: jest.fn(),
    findEntries: jest.fn(),
    updateEntry: jest.fn(),
    removeEntry: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [{ provide: GoalsService, useValue: mockService }],
    }).compile();

    controller = module.get<GoalsController>(GoalsController);
    jest.clearAllMocks();
  });

  const mockGoal = { id: 'goal-1', name: 'Emergency Fund', targetAmount: 10000 };
  const mockEntry = { id: 'entry-1', goalId: 'goal-1', year: 2026, month: 7, plannedAmount: 500 };

  it('should create a goal', async () => {
    mockService.create.mockResolvedValue(mockGoal);
    const result = await controller.create({ name: 'Emergency Fund', targetAmount: 10000 });
    expect(result).toEqual(mockGoal);
  });

  it('should return all goals', async () => {
    mockService.findAll.mockResolvedValue([mockGoal]);
    expect(await controller.findAll()).toEqual([mockGoal]);
  });

  it('should return a goal by id', async () => {
    mockService.findOne.mockResolvedValue(mockGoal);
    expect(await controller.findOne('goal-1')).toEqual(mockGoal);
  });

  it('should update a goal', async () => {
    mockService.update.mockResolvedValue({ ...mockGoal, name: 'Updated' });
    const result = await controller.update('goal-1', { name: 'Updated' });
    expect(result.name).toBe('Updated');
  });

  it('should delete a goal', async () => {
    mockService.remove.mockResolvedValue(mockGoal);
    expect(await controller.remove('goal-1')).toEqual(mockGoal);
  });

  it('should create a goal entry', async () => {
    mockService.createEntry.mockResolvedValue(mockEntry);
    const result = await controller.createEntry({
      goalId: 'goal-1', year: 2026, month: 7, plannedAmount: 500,
    });
    expect(result).toEqual(mockEntry);
  });

  it('should return entries for a goal', async () => {
    mockService.findEntries.mockResolvedValue([mockEntry]);
    expect(await controller.findEntries('goal-1')).toEqual([mockEntry]);
  });

  it('should update a goal entry', async () => {
    mockService.updateEntry.mockResolvedValue({ ...mockEntry, actualAmount: 450 });
    const result = await controller.updateEntry('entry-1', { actualAmount: 450 });
    expect(result.actualAmount).toBe(450);
  });

  it('should delete a goal entry', async () => {
    mockService.removeEntry.mockResolvedValue(mockEntry);
    expect(await controller.removeEntry('entry-1')).toEqual(mockEntry);
  });
});
