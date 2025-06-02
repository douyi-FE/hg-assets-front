import { message } from 'ant-design-vue';
import { exportExcel } from './commonFuncs';

// 打开Excel文件
export const openExcelFile = function () {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = false;
  input.accept = '.xlsx';
  input.onchange = function (e) {
    const file = e.target.files[0];
    const wb = GC.Spread.Sheets.findControl('importSpread');
    wb.import(file, () => {
      // 
    });
  };
  input.click();
};

// 导入excel
export const importExcel = function (openImportModal, activeSheet) {
  const wb = GC.Spread.Sheets.findControl('importSpread');
  if (wb) {
    const sheet = wb.getActiveSheet();
    if (sheet && activeSheet) {
      // 先获取模板的数据起点和列范围
      const table = activeSheet.tables.all()[0];
      const tableDataRange = table.dataRange();
      const startRow = tableDataRange.row;
      const startColumn = tableDataRange.col;
      const endColumn = tableDataRange.col + tableDataRange.colCount;
      // 再获取导入数据的有效数据范围
      const usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data);
      if (!usedRange) {
        message.warning('未找到有效数据区域，请检查');
        return;
      }
      const row = usedRange.row;
      const column = usedRange.col;
      const rowCount = usedRange.rowCount;
      const columnCount = usedRange.colCount;
      // 校验数据区域有效性
      if (row + rowCount < startRow || column + columnCount < endColumn) {
        message.warning('导入数据区域与模板数据区域不匹配，请检查');
      } else {
        const importData = sheet.getArray(startRow, startColumn, rowCount, endColumn);
        const importDataSource = [];
        if (importData.length > 0) {
          const tableFields = [];
          for (let i = 0; i < tableDataRange.colCount; i++) {
            tableFields.push(table.getColumnDataField(i));
          }
          importData.forEach((item) => {
            const importItem = {};
            item.forEach((field, index) => {
              if (tableFields[index]) {
                importItem[tableFields[index]] = field;
              }
            });
            importDataSource.push(importItem);
          });
        }
        // 追加到表格数据源中
        const sheetData = activeSheet.getDataSource().getSource();
        Object.keys(sheetData).forEach((key) => {
          if (key.startsWith('table')) {
            sheetData[key].push(...importDataSource);
          }
        });
        activeSheet.suspendPaint();
        table.showFooter(false);
        activeSheet.addRows(activeSheet.getRowCount(), rowCount);
        activeSheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(sheetData));
        table.showFooter(true);
        activeSheet.resumePaint();
        // 关闭模态窗口
        openImportModal.value = false;
      }
    } else {
      message.warning('未找到有效表单，请检查');
    }
  } else {
    message.warning('请先打开导入模态窗');
  }
};

// 下载模板
export const downloadTemplate = function () {
  exportExcel(false);
};
