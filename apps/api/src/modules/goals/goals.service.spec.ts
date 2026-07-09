import { Test, TestingModule } from '@nestjs/testing';
import { GoalsService } from './goals.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('GoalsService', () => {
  let service: GoalsService;

  const mockPrisma = {
    goal: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    goalEntry: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
    jest.clearAllMocks();
  });

  describe('Goals', () => {
    const mockGoal = {
      id: 'goal-1',
      name: 'Emergency Fund',
      targetAmount: 10000,
      targetDate: null,
      status: 'ACTIVE',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a goal', async () => {
      mockPrisma.goal.create.mockResolvedValue(mockGoal);
      const result = await service.create({ name: 'Emergency Fund', targetAmount: 10000 });
      expect(result).toEqual(mockGoal);
      expect(mockPrisma.goal.create).toHaveBeenCalledWith({
        data: { name: 'Emergency Fund', targetAmount: 10000 },
      });
    });

    it('should return all goals', async () => {
      mockPrisma.goal.findMany.mockResolvedValue([mockGoal]);
      const result = await service.findAll();
      expect(result).toEqual([mockGoal]);
    });

    it('should return a goal by id with entries', async () => {
      const goalWithEntries = { ...mockGoal, entries: [] };
      mockPrisma.goal.findUnique.mockResolvedValue(goalWithEntries);
      const result = await service.findOne('goal-1');
      expect(result).toEqual(goalWithEntries);
      expect(mockPrisma.goal.findUnique).toHaveBeenCalledWith({
        where: { id: 'goal-1' },
        include: { entries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
      });
    });

    it('should update a goal', async () => {
      mockPrisma.goal.update.mockResolvedValue({ ...mockGoal, name: 'Updated' });
      const result = await service.update('goal-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('should delete a goal', async () => {
      mockPrisma.goal.delete.mockResolvedValue(mockGoal);
      const result = await service.remove('goal-1');
      expect(result).toEqual(mockGoal);
    });
  });

  describe('GoalEntries', () => {
    const mockEntry = {
      id: 'entry-1',
      goalId: 'goal-1',
      year: 2026,
      month: 7,
      plannedAmount: 500,
      actualAmount: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a goal entry', async () => {
      mockPrisma.goalEntry.create.mockResolvedValue(mockEntry);
      const result = await service.createEntry({
        goalId: 'goal-1', year: 2026, month: 7, plannedAmount: 500,
      });
      expect(result).toEqual(mockEntry);
    });

    it('should return entries for a goal', async () => {
      mockPrisma.goalEntry.findMany.mockResolvedValue([mockEntry]);
      const result = await service.findEntries('goal-1');
      expect(result).toEqual([mockEntry]);
      expect(mockPrisma.goalEntry.findMany).toHaveBeenCalledWith({
        where: { goalId: 'goal-1' },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      });
    });

    it('should update a goal entry', async () => {
      mockPrisma.goalEntry.update.mockResolvedValue({ ...mockEntry, actualAmount: 450 });
      const result = await service.updateEntry('entry-1', { actualAmount: 450 });
      expect(result.actualAmount).toBe(450);
    });

    it('should delete a goal entry', async () => {
      mockPrisma.goalEntry.delete.mockResolvedValue(mockEntry);
      const result = await service.removeEntry('entry-1');
      expect(result).toEqual(mockEntry);
    });
  });
});
