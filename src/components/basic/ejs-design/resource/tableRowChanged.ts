import { store } from '../store';
import { setTableRowChangedCellType } from './fileUploadCellType';

// 监听表格行变化，自动带入列样式
export function tableRowChanged() {
  (store.spread as any).bind(GC.Spread.Sheets.Events.TableRowsChanged, function (e, data) {
    const propertyName = data.propertyName;
    if (propertyName === 'tableInsertRows') {
      const sheet = data.sheet;
      const table = data.table;
      const row = data.row;
      const count = data.count;
      const fromRow = row + count;
      // 默认从前插入行，没有开放从后边插入行
      // const isAfter = data.isAfter;
      // 插入行后，自动带入列设置
      setTableRows(store.spread, sheet, table.dataRange(), fromRow, row, count);
    }
  });
  (store.spread as any).bind(GC.Spread.Sheets.Events.TableResized, function (e, data) {
    // 监听，暂不处理
    console.log('tableResized', data);
  });
}

function setTableRows(spread, sheet, tableRange, fromRow, row, rowCount) {
  sheet.suspendPaint();
  const tableStartRow = tableRange.row;
  const col = tableRange.col;
  const colCount = tableRange.colCount;
  for (let c = col; c < col + colCount; c++) {
    // // 如果不是超链接（文件上传下载），只需要配置样式和验证
    // const style = sheet.getStyle(tableStartRow + fromRow, c);
    // const validator = sheet.getDataValidator(tableStartRow + fromRow, c);
    // for (let r = row; r < row + rowCount; r++) {
    //   if (style) {
    //     sheet.setStyle(tableStartRow + r, c, style);
    //   }
    //   if (validator) {
    //     sheet.setDataValidator(tableStartRow + r, c, validator);
    //   }
    // }
    //TODO: 尝试识别单元格类型，不要耦合
    // 如果不是超链接（文件上传下载），只需要配置样式和验证
    const cellType = sheet.getCellType(tableStartRow + fromRow, c);
    if (cellType.typeName !== 'FileUploadCellType') {
      const style = sheet.getStyle(tableStartRow + fromRow, c);
      const validator = sheet.getDataValidator(tableStartRow + fromRow, c);
      for (let r = row; r < row + rowCount; r++) {
        if (style) {
          sheet.setStyle(tableStartRow + r, c, style);
        }
        if (validator) {
          sheet.setDataValidator(tableStartRow + r, c, validator);
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
