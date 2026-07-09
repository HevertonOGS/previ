import { PartialType } from '@nestjs/swagger';
import { CreateCurrentExpenseDto } from './create-current-expense.dto';

export class UpdateCurrentExpenseDto extends PartialType(CreateCurrentExpenseDto) {}
