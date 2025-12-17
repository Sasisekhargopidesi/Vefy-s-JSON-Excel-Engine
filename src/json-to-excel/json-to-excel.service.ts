import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

@Injectable()
export class JsonToExcelService {
  private readonly logger = new Logger(JsonToExcelService.name);

  /**
   * Main function: converts JSON buffer to Excel buffer
   */
  async convertJsonToExcel(jsonBuffer: Buffer): Promise<Buffer> {
    try {
      const jsonData = JSON.parse(jsonBuffer.toString('utf-8'));

      // Input can be a single object or an array with one/many objects
      if (Array.isArray(jsonData)) {
        if (jsonData.length === 0) {
          throw new Error('Input JSON array is empty');
        }
        // For this assessment: assume first element is the company profile object
        return await this.processRootObject(jsonData[0]);
      }

      if (typeof jsonData === 'object' && jsonData !== null) {
        return await this.processRootObject(jsonData);
      }

      throw new Error('JSON must be an object or array of objects');
    } catch (error) {
      this.logger.error('JSON conversion error:', error);
      throw new Error(`Failed to convert JSON: ${(error as Error).message}`);
    }
  }

  /**
   * Process root object:
   * - Workbook name from top-level "key"
   * - Sheets from TOP-2 keys inside "value" ONLY
   */
  private async processRootObject(root: any): Promise<Buffer> {
    // 1️⃣ Workbook name from top-level "key"
    const workbookName: string = root?.key || 'Export';
    this.logger.log(`Creating workbook for key: ${workbookName}`);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NestJS JSON → Excel Converter';
    workbook.created = new Date();
    workbook.title = workbookName;

    // 2️⃣ Sheets from TOP-2 keys inside "value"
    const valueObj = root?.value;
    if (!valueObj || typeof valueObj !== 'object') {
      this.logger.warn('Root has no valid "value" object; creating empty workbook');
      const sheet = workbook.addWorksheet('Empty');
      sheet.addRow(['No data']);
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    }

    for (const [top2Key, top2Value] of Object.entries(valueObj)) {
      // Rule: only create sheets for nested data:
      // - object
      // - array of objects
      if (!this.shouldCreateSheetForValue(top2Value)) {
        continue;
      }

      const sheetName = this.sanitizeSheetName(top2Key);
      this.logger.log(`Creating sheet for top-2 key: ${sheetName}`);

      if (Array.isArray(top2Value)) {
        // ✅ Case 1: Array of objects → table
        await this.renderArraySheet(workbook, sheetName, top2Value);
      } else if (typeof top2Value === 'object' && top2Value !== null) {
        // ✅ Case 2: Single object → field–value with nested sections
        await this.renderObjectSheet(workbook, sheetName, top2Value);
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  /**
   * Decide if a TOP-2 key should become a sheet
   * - YES if:
   *   - value is an object (non-null)
   *   - OR value is an array containing at least one object
   * - NO for primitive values like strings, numbers, booleans, null
   */
  private shouldCreateSheetForValue(value: any): boolean {
    if (value === null || value === undefined) return false;

    if (Array.isArray(value)) {
      // Create sheet only if array has at least one object item
      return value.some(item => typeof item === 'object' && item !== null);
    }

    if (typeof value === 'object') {
      return true;
    }

    // primitives: string, number, boolean → no sheet
    return false;
  }

  /**
   * ✅ Case 1:
   * Render sheet for array of objects in TABLE FORMAT
   * - Columns = union of all object keys (header from first object is enough, but we union to avoid data loss)
   * - Each object = one row
   */
  private async renderArraySheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    data: any[],
  ): Promise<void> {
    const sheet = workbook.addWorksheet(sheetName);

    if (!data || data.length === 0) {
      sheet.addRow(['No data']);
      return;
    }

    // Collect all keys from all objects to avoid losing sparse fields
    const allKeys = new Set<string>();
    for (const item of data) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach(k => allKeys.add(k));
      }
    }

    const columns = Array.from(allKeys);
    if (columns.length === 0) {
      sheet.addRow(['No object fields to display']);
      return;
    }

    // Define columns
    sheet.columns = columns.map(col => ({
      header: col,
      key: col,
      width: 20,
    }));

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Add one row per object
    for (const item of data) {
      const row: Record<string, any> = {};
      for (const col of columns) {
        const value = item ? item[col] : undefined;
        row[col] = this.formatCellValue(value);
      }
      sheet.addRow(row);
    }
  }

  /**
   * ✅ Case 2:
   * Render sheet for single object in FIELD–VALUE FORMAT
   * - Two columns: Field | Value
   * - Nested objects:
   *   - Parent key as bold section header
   *   - Children below, indented
   *   - Recursively applied
   */
  private async renderObjectSheet(
    workbook: ExcelJS.Workbook,
    sheetName: string,
    obj: any,
  ): Promise<void> {
    const sheet = workbook.addWorksheet(sheetName);

    // Define 2-column layout
    sheet.columns = [
      { header: 'Field', key: 'field', width: 32 },
      { header: 'Value', key: 'value', width: 64 },
    ];

    // Style header
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    // Start recursive rendering at indent level 0
    this.renderNestedObject(sheet, obj, 0);
  }

  /**
   * Recursively render nested object into the 2-column sheet
   * Rules:
   * - Primitive → normal row: Field | Value
   * - null → empty value
   * - Array of primitives → comma-separated
   * - Array of objects → table-like description or count
   * - Nested object → bold section header + recursive children (same sheet)
   */
  private renderNestedObject(
    sheet: ExcelJS.Worksheet,
    obj: any,
    indentLevel: number,
  ): void {
    if (!obj || typeof obj !== 'object') return;

    for (const [key, value] of Object.entries(obj)) {
      // Handle null / undefined
      if (value === null || value === undefined) {
        const row = sheet.addRow({ field: key, value: '' });
        this.applyFieldStyle(row, indentLevel, false);
        continue;
      }

      // Arrays
      if (Array.isArray(value)) {
        if (value.length === 0) {
          const row = sheet.addRow({ field: key, value: '[]' });
          this.applyFieldStyle(row, indentLevel, false);
          continue;
        }

        // Array of primitives → comma-separated string
        if (value.every(v => this.isPrimitive(v))) {
          const joined = value.map(v => this.formatCellValue(v)).join(', ');
          const row = sheet.addRow({ field: key, value: joined });
          this.applyFieldStyle(row, indentLevel, false);
          continue;
        }

        // Array of objects → describe as table within same sheet (optional)
        // Here: show number of items and type, avoid creating extra nested sheets
        const info = `[Array of ${value.length} object(s)]`;
        const row = sheet.addRow({ field: key, value: info });
        this.applyFieldStyle(row, indentLevel, false);
        continue;
      }

      // Nested object → section header + recurse
      if (typeof value === 'object') {
        // Section header row for parent key
        const sectionRow = sheet.addRow({ field: key, value: '' });
        sectionRow.font = { bold: true };
        sectionRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFEEEEEE' },
        };
        sectionRow.getCell('field').alignment = {
          indent: indentLevel,
          wrapText: true,
          vertical: 'top',
        };

        // Recurse for child properties with increased indent
        this.renderNestedObject(sheet, value, indentLevel + 1);
        continue;
      }

      // Primitive value → direct field/value row
      const row = sheet.addRow({
        field: key,
        value: this.formatCellValue(value),
      });
      this.applyFieldStyle(row, indentLevel, false);
    }
  }

  /**
   * Apply alignment and indentation to a normal field row
   */
  private applyFieldStyle(
    row: ExcelJS.Row,
    indentLevel: number,
    bold: boolean,
  ): void {
    const fieldCell = row.getCell('field');
    fieldCell.alignment = {
      indent: indentLevel,
      wrapText: true,
      vertical: 'top',
    };
    if (bold) {
      fieldCell.font = { bold: true };
    }

    const valueCell = row.getCell('value');
    valueCell.alignment = {
      wrapText: true,
      vertical: 'top',
    };
  }

  /**
   * Process array root (fallback / legacy)
   * Not used for your main assessment case, but kept for flexibility.
   */
  private async processArrayOfObjects(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'NestJS JSON → Excel Converter';
    workbook.created = new Date();

    if (data.length === 0) {
      const sheet = workbook.addWorksheet('Empty');
      sheet.addRow(['No data']);
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer as unknown as Buffer;
    }

    const sheet = workbook.addWorksheet('MainData');

    // Gather columns
    const allKeys = new Set<string>();
    for (const item of data) {
      if (item && typeof item === 'object' && !Array.isArray(item)) {
        Object.keys(item).forEach(k => allKeys.add(k));
      }
    }

    const columns = Array.from(allKeys);
    sheet.columns = columns.map(col => ({
      header: col,
      key: col,
      width: 20,
    }));

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFD3D3D3' },
    };

    data.forEach(item => {
      const row: Record<string, any> = {};
      columns.forEach(col => {
        row[col] = this.formatCellValue(item ? item[col] : undefined);
      });
      sheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as unknown as Buffer;
  }

  /**
   * Utility: check if value is primitive
   */
  private isPrimitive(val: any): boolean {
    return (
      val === null ||
      val === undefined ||
      typeof val === 'string' ||
      typeof val === 'number' ||
      typeof val === 'boolean'
    );
  }

  /**
   * Utility: consistent formatting for cell values
   */
  private formatCellValue(val: any): string {
    if (val === null || val === undefined) return '';

    if (typeof val === 'string') return val;
    if (typeof val === 'number' || typeof val === 'boolean') {
      return String(val);
    }

    if (Array.isArray(val)) {
      if (val.every(v => this.isPrimitive(v))) {
        return val.map(v => this.formatCellValue(v)).join(', ');
      }
      return JSON.stringify(val);
    }

    if (typeof val === 'object') {
      return JSON.stringify(val);
    }

    return String(val);
  }

  /**
   * Sanitize sheet name (max 31 chars, remove invalid characters)
   */
  private sanitizeSheetName(name: string): string {
    let safe = name.replace(/[\\/*?:\\[\\]]/g, '_').slice(0, 31).trim();
    if (!safe) safe = 'Sheet';
    return safe;
  }
}
