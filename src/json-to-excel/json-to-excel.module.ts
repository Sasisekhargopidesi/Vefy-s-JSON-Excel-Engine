import { Module } from '@nestjs/common';
import { JsonToExcelController } from './json-to-excel.controller';
import { JsonToExcelService } from './json-to-excel.service';

@Module({
  controllers: [JsonToExcelController],
  providers: [JsonToExcelService],
})
export class JsonToExcelModule {}
