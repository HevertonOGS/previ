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
import { ImportService, type StatementFileType } from './import.service';
import { NotionImportService, type NotionTableType } from './notion-import.service';
import { ConfirmImportDto } from './dto';
import {
  ConfirmNotionIncomesDto,
  ConfirmNotionGeneralExpensesDto,
  ConfirmNotionCurrentExpensesDto,
  ConfirmNotionGoalsDto,
} from './dto/confirm-notion-import.dto';

const NOTION_TYPES: NotionTableType[] = ['incomes', 'general-expenses', 'current-expenses', 'goals'];

@ApiTags('Import')
@Controller('import')
export class ImportController {
  public constructor(
    private readonly service: ImportService,
    private readonly notionService: NotionImportService,
  ) {}

  // ── Bank statement ──────────────────────────────────────────────────────────

  @Post('statement/parse')
  @ApiOperation({ summary: 'Upload and parse a bank statement (OFX or CSV)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  public parseStatement(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    const type: StatementFileType = ext === 'ofx' ? 'ofx' : 'csv';
    return { transactions: this.service.parseStatement(file.buffer, type) };
  }

  @Post('statement/confirm')
  @ApiOperation({ summary: 'Save confirmed bank transactions as current expenses' })
  public async confirmStatement(@Body() dto: ConfirmImportDto) {
    return this.service.confirmImport(dto);
  }

  // ── Notion ──────────────────────────────────────────────────────────────────

  @Post('notion/parse')
  @ApiOperation({ summary: 'Upload and parse a Notion CSV export' })
  @ApiConsumes('multipart/form-data')
  @ApiQuery({ name: 'type', enum: NOTION_TYPES })
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  public parseNotion(
    @UploadedFile() file: Express.Multer.File,
    @Query('type') type: NotionTableType,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!NOTION_TYPES.includes(type)) throw new BadRequestException('Invalid table type');
    return { rows: this.notionService.parseFile(file.buffer, type) };
  }

  @Post('notion/incomes/confirm')
  @ApiOperation({ summary: 'Save confirmed Notion incomes' })
  public async confirmNotionIncomes(@Body() dto: ConfirmNotionIncomesDto) {
    return this.notionService.confirmIncomes(dto);
  }

  @Post('notion/general-expenses/confirm')
  @ApiOperation({ summary: 'Save confirmed Notion general expenses' })
  public async confirmNotionGeneralExpenses(@Body() dto: ConfirmNotionGeneralExpensesDto) {
    return this.notionService.confirmGeneralExpenses(dto);
  }

  @Post('notion/current-expenses/confirm')
  @ApiOperation({ summary: 'Save confirmed Notion current expenses' })
  public async confirmNotionCurrentExpenses(@Body() dto: ConfirmNotionCurrentExpensesDto) {
    return this.notionService.confirmCurrentExpenses(dto);
  }

  @Post('notion/goals/confirm')
  @ApiOperation({ summary: 'Save confirmed Notion goal entries' })
  public async confirmNotionGoals(@Body() dto: ConfirmNotionGoalsDto) {
    return this.notionService.confirmGoals(dto);
  }
}
