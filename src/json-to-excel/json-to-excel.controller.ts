// json-to-excel.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JsonToExcelService } from './json-to-excel.service';

@Controller('convert')
export class JsonToExcelController {
  constructor(private readonly service: JsonToExcelService) {}

  @Post('json-to-excel')
  @UseInterceptors(FileInterceptor('file'))
  async convert(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    // ✅ SAFETY CHECK (this prevents 500 error)
    if (!file) {
      throw new BadRequestException('JSON file is required');
    }

    const buffer = await this.service.convertJsonToExcel(file.buffer);

    const originalName = file.originalname || 'output.json';
    const baseName = originalName.replace(/\.[^/.]+$/, '');
    const fileName = `${baseName}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`,
    );

    res.send(buffer);
  }
}
