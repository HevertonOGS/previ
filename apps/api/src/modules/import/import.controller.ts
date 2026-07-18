import {
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import type { ImportEntityType } from 'shared-types';

import { ConfirmGoalsImportDto, ConfirmImportDto, ConfirmSpreadsheetImportDto } from './dto';
import { GoalsImportService } from './goals-import.service';
import { ImportService, type StatementFileType } from './import.service';
import type { ParsedGoalEntry } from './parsers/goals.parser';
import type { ParsedTransaction } from './parsers/ofx.parser';
import type { ParsedSpreadsheet } from './parsers/spreadsheet.parser';
import { SpreadsheetImportService, type SkippedRow } from './spreadsheet-import.service';

const IMPORT_ENTITY_TYPES: ImportEntityType[] = ['income', 'general-expense', 'current-expense'];

@ApiTags('Import')
@Controller('import')
export class ImportController {
  public constructor(
    private readonly service: ImportService,
    private readonly spreadsheetService: SpreadsheetImportService,
    private readonly goalsService: GoalsImportService,
  ) {}

  // ── Bank statement ──────────────────────────────────────────────────────────

  @Post('statement/parse')
  @ApiOperation({ summary: 'Upload and parse a bank statement (OFX or CSV)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  public parseStatement(@UploadedFile() file: Express.Multer.File): {
    transactions: ParsedTransaction[];
  } {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const type: StatementFileType = ext === 'ofx' ? 'ofx' : 'csv';
    return { transactions: this.service.parseStatement(file.buffer, type) };
  }

  @Post('statement/confirm')
  @ApiOperation({ summary: 'Save confirmed bank transactions as current expenses' })
  public async confirmStatement(@Body() dto: ConfirmImportDto): Promise<{ created: number }> {
    return this.service.confirmImport(dto);
  }

  // ── Spreadsheet (flexible column mapping) ─────────────────────────────────────

  @Post('spreadsheet/parse')
  @ApiOperation({ summary: 'Upload and parse a spreadsheet (CSV) for a given entity type' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'entityType', enum: IMPORT_ENTITY_TYPES })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  public parseSpreadsheet(
    @UploadedFile() file: Express.Multer.File,
    @Query('entityType') entityType: ImportEntityType,
  ): ParsedSpreadsheet {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!IMPORT_ENTITY_TYPES.includes(entityType)) throw new BadRequestException('Invalid entity type');
    return this.spreadsheetService.parseFile(file.buffer, entityType);
  }

  @Post('spreadsheet/confirm')
  @ApiOperation({ summary: 'Save confirmed spreadsheet rows using a user-confirmed column mapping' })
  public async confirmSpreadsheet(
    @Body() dto: ConfirmSpreadsheetImportDto,
  ): Promise<{ created: number; skipped: SkippedRow[] }> {
    return this.spreadsheetService.confirm(dto);
  }

  // ── Goals ───────────────────────────────────────────────────────────────────

  @Post('goals/parse')
  @ApiOperation({ summary: 'Upload and parse a goal entries CSV' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  public parseGoals(@UploadedFile() file: Express.Multer.File): { rows: ParsedGoalEntry[] } {
    if (!file) throw new BadRequestException('No file uploaded');
    return { rows: this.goalsService.parseFile(file.buffer) };
  }

  @Post('goals/confirm')
  @ApiOperation({ summary: 'Save confirmed goal entries' })
  public async confirmGoals(@Body() dto: ConfirmGoalsImportDto): Promise<{ created: number }> {
    return this.goalsService.confirm(dto);
  }
}
