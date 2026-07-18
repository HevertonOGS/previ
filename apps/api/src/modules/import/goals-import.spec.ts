import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from '../../prisma/prisma.service';

import { GoalsImportService } from './goals-import.service';

describe('GoalsImportService', () => {
  let service: GoalsImportService;

  const mockPrisma = {
    goalEntry: { createMany: jest.fn() },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsImportService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<GoalsImportService>(GoalsImportService);
    jest.clearAllMocks();
  });

  describe('parseFile', () => {
    it('should parse a goals CSV buffer', () => {
      const buffer = Buffer.from('mês;valor previsto\nJaneiro 2026;500,00\n');

      const result = service.parseFile(buffer);

      expect(result).toHaveLength(1);
      expect(result[0].year).toBe(2026);
      expect(result[0].month).toBe(1);
    });
  });

  describe('confirm', () => {
    it('should create GoalEntry records for confirmed rows', async () => {
      mockPrisma.goalEntry.createMany.mockResolvedValue({ count: 1 });

      const dto = {
        goalId: 'goal-1',
        rows: [{ tempId: 'tmp-1', year: 2026, month: 1, plannedAmount: 500, actualAmount: 500 }],
      };

      const result = await service.confirm(dto);

      expect(result.created).toBe(1);
      expect(mockPrisma.goalEntry.createMany).toHaveBeenCalledWith({
        data: [{ goalId: 'goal-1', year: 2026, month: 1, plannedAmount: 500, actualAmount: 500 }],
        skipDuplicates: true,
      });
    });
  });
});
