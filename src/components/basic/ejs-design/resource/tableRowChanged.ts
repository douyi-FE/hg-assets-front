import { message } from 'ant-design-vue';
import { fillFileUploadCellType, setTableRowChangedCellType, FileUploadCellType } from './fileUploadCellType';

// 监听表格行变化，自动带入列样式
export function tableRowChanged(spread: any) {
  spread.bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
    const propertyName = data.propertyName;
    if (propertyName === 'tableInsertRows') {
      const sheet = data.sheet;
      const table = data.table;
      const range = table.dataRange();
      const row = data.row + range.row - 1;
      const count = data.count;
      const fromRow = row + count;
      // 默认从前插入行，没有开放从后边插入行
      // const isAfter = data.isAfter;
      // 插入行后，自动带入列设置
      fillTableRows(spread, sheet, table.dataRange(), fromRow, count);
    }
  });
  spread.bind(GC.Spread.Sheets.Events.TableResized, function (e, data) {
    // 监听，暂不处理
    console.log('tableResized', data);
  });

  // 监听表格列变化，取消表格绑定，并提醒重新绑定表单
  spread.bind(GC.Spread.Sheets.Events.TableColumnsChanged, function (e, param) {
    // 不要自动转成区域，重新设置表单需要沿用原来的tableName
    // const sheet = param.sheet;
    // const table = param.table;
    // sheet.getParent().commandManager().execute({ cmd: 'tableToRange', sheetName: sheet.name(), tableName: table.name() });
    message.warning('监测到表格列变化，请重新绑定表单');
  });
}

export function fillTableRows(spread, sheet, tableRange, fromRow, rowCount, needClear = true) {
  const startRow = tableRange.row < fromRow ? fromRow : tableRange.row;
  const startRange = new GC.Spread.Sheets.Range(startRow - 1, tableRange.col, 1, tableRange.colCount);
  const fillRange = new GC.Spread.Sheets.Range(startRow, tableRange.col, rowCount, tableRange.colCount - 1);
  sheet.suspendPaint();
  sheet.suspendCalcService();
  spread.commandManager().execute({
    cmd: "fill",
    sheetName: sheet.name(),
    startRange: startRange,
    fillRange: fillRange,
    autoFillType: GC.Spread.Sheets.Fill.AutoFillType.copyCells,
    fillDirection: GC.Spread.Sheets.Fill.FillDirection.down
  });
  if (needClear) {
    sheet.getRange(fillRange.row, fillRange.col, fillRange.rowCount, fillRange.colCount).value(null);
  }
  fillFileUploadCellType(sheet, startRange, fillRange);
  sheet.resumeCalcService(true);
  sheet.resumePaint();
}

export function fillFormulas(spread, sheet, dataRange, col) {
  const startRow = dataRange.row;
  const startRange = new GC.Spread.Sheets.Range(startRow, col, 1, 1);
  const fillRange = new GC.Spread.Sheets.Range(startRow, col, dataRange.rowCount, 1);
  sheet.fillAuto(startRange, fillRange, {
    fillType: GC.Spread.Sheets.Fill.FillType.auto,
    series: GC.Spread.Sheets.Fill.FillSeries.column,
    direction: GC.Spread.Sheets.Fill.FillDirection.down,
  });
}

export function fillCellTypes(sheet, dataRange, col) {
  const startRow = dataRange.row;
  const cellType = sheet.getCellType(startRow, col);
  if (cellType.typeName !== 'TemplateCellType') {
    const endRow = dataRange.row + dataRange.rowCount;
    if (cellType.typeName === 'FileUploadCellType') {
      for (let r = startRow; r < endRow; r++) {
        const currentCellType = sheet.getCellType(r, col);
        if (currentCellType.typeName !== 'FileUploadCellType') {
          sheet.setCellType(r, col, new FileUploadCellType());
        }
      }
    } else {
      for (let r = startRow; r < endRow; r++) {
        const currentCellType = sheet.getCellType(r, col);
        if (currentCellType.typeName !== cellType.typeName) {
          sheet.setCellType(r, col, cellType);
        }
      }
    }
  }
}

// 弃用
export function setTableRows(spread, sheet, tableRange, fromRow, row, rowCount) {
  sheet.suspendPaint();
  const tableStartRow = tableRange.row;
  const col = tableRange.col;
  const colCount = tableRange.colCount;
  for (let c = col; c < col + colCount; c++) {
    // 如果不是超链接（文件上传下载），只需要配置样式和验证
    const cellType = sheet.getCellType(tableStartRow + fromRow, c);
    if (cellType.typeName !== 'FileUploadCellType') {
      const style = sheet.getStyle(tableStartRow + fromRow, c);
      const formula = sheet.getFormula(tableStartRow + fromRow, c);
      const validator = sheet.getDataValidator(tableStartRow + fromRow, c);
      for (let r = row; r < row + rowCount; r++) {
        if (style) {
          sheet.setStyle(tableStartRow + r, c, style);
        }
        if (validator) {
          sheet.setDataValidator(tableStartRow + r, c, validator);
        }
        if (formula) {
          sheet.setFormula(tableStartRow + r, c, formula);
        }
      }
    } else {
      // 如果是超链接（文件上传下载）
      for (let r = row; r < row + rowCount; r++) {
        setTableRowChangedCellType(spread, sheet.getRange(tableStartRow + r, c, 1, 1));
      }
    }
  }
  sheet.resumePaint();
}
