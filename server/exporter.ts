import { Parser as Json2csvParser } from 'json2csv';
import ExcelJS from 'exceljs';

export async function exportToCSV(data: any[], fields?: string[]): Promise<Buffer> {
  const opts = fields ? { fields } : {};
  const parser = new Json2csvParser(opts);
  const csv = parser.parse(data);
  return Buffer.from(csv, 'utf-8');
}

export async function exportToExcel(data: any[], sheetName = 'Sheet1'): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({ header: key, key }));
    worksheet.addRows(data);
  }
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
