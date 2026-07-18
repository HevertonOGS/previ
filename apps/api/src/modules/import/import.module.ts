import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { GoalsImportService } from './goals-import.service';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { SpreadsheetImportService } from './spreadsheet-import.service';

@Module({
  imports: [MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } })],
  controllers: [ImportController],
  providers: [ImportService, SpreadsheetImportService, GoalsImportService],
})
export class ImportModule {}
