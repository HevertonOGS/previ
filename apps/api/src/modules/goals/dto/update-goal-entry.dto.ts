import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateGoalEntryDto } from './create-goal-entry.dto';

export class UpdateGoalEntryDto extends PartialType(
  OmitType(CreateGoalEntryDto, ['goalId', 'year', 'month'] as const),
) {}
