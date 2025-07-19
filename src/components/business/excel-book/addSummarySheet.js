import { addSheetRows } from './commonFuncs';

const protectionOptions = {
  allowSelectLockedCells: true,
  allowSelectUnlockedCells: true,
  allowSort: true,
  allowFilter: true,
  allowEditObjects: true,
  allowResizeRows: true,
  allowResizeColumns: true,
  allowDragInsertRows: true,
  allowInsertRows: true,
  allowDeleteRows: true,
  allowOutlineRows: false,
  allowOutlineColumns: false,
};

export const getSummaryDataTable = function (summaryData) {
  let tableBindingPath = {};
  if (!summaryData) {
    return null;
  }
  Object.keys(summaryData).forEach((key) => {
    if (key.startsWith('_')) return;
    const sheetData = summaryData[key];
    Object.keys(sheetData).forEach((sheetKey) => {
      if (sheetKey.startsWith('table')) {
        tableBindingPath[key] = sheetData[sheetKey];
      }
    });
  });
  return tableBindingPath;
};

// 取消动态汇总表，改为模板中配置
export const setSummarySheet = function (spread, summaryData) {
  const sheet = spread.getActiveSheet();
  let summarySheet = spread.getSheetFromName('汇总表');
  if (!summarySheet) {
    return;
  }
  summarySheet.isSelected(false);
  // summarySheet.options.protectionOptions = protectionOptions;
  // summarySheet.options.isProtected = true;
  addSheetRows(summarySheet, summaryData);
  const tableName = Object.keys(summaryData).find((key) => key.startsWith('table'));
  if (!tableName) {
    return;
  }
  const tableData = summaryData[tableName];
  if (!tableData) {
    return;
  }
  const dataCount = tableData.length;
  const table = summarySheet.tables.all()[0];
  summaryData[table.bindingPath()] = tableData;
  delete summaryData[tableName];
  const rowCount = table.range().rowCount;
  if (dataCount > rowCount) {
    summarySheet.addRows(summarySheet.getRowCount(), dataCount - rowCount + 4);
  }
  summarySheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(summaryData));
};

// 已过期
export const canSwitchSummaryType = function (spread, summaryByTypeDisabled) {
  const summarySheet = spread.getSheetFromName('汇总表');
  if (summarySheet) {
    summaryByTypeDisabled.value = false;
  } else {
    summaryByTypeDisabled.value = true;
  }
};

// 自动合并
const autoMerge = function (sheet, table, cols) {
  const dataRange = table.dataRange();
  for (let c = 0; c < cols.length; c++) {
    const range = new GC.Spread.Sheets.Range(dataRange.row, cols[c], dataRange.rowCount, 1);
    sheet.autoMerge(range, GC.Spread.Sheets.AutoMerge.AutoMergeDirection.none);
    sheet.autoMerge(
      range,
      GC.Spread.Sheets.AutoMerge.AutoMergeDirection.column,
      GC.Spread.Sheets.AutoMerge.AutoMergeMode.restricted,
    );
  }
};

// 表格左侧插入列
const insertLeftColumns = function (sheet) {
  const table = sheet.tables.all()[0];
  const range = table.range();
  const dataRange = table.dataRange();
  let titleRowCount = dataRange.row - range.row;
  if (titleRowCount > 1) {
    sheet.addSpan(range.row, range.col, titleRowCount, 1);
  }
  sheet.setValue(range.row, range.col, '创建人');
  sheet.setStyle(range.row, range.col, sheet.getStyle(range.row, 2));
};

// 插入创建人字段
export const insertTableColumns = function (sheet, dataSource) {
  // 添加表格列：创建人
  sheet.suspendPaint();
  sheet.suspendCalcService();
  const table = sheet.tables.all()[0];
  const tableRange = table.range();
  const lastField = table.getColumnDataField(tableRange.colCount - 1);
  addSheetRows(sheet, { [sheet.name()]: dataSource });
  if (lastField === '创建人') {
    sheet.resumeCalcService(true);
    sheet.resumePaint();
    return;
  }
  sheet.addColumns(sheet.getColumnCount(), 1);
  table.insertColumns(tableRange.colCount - 1, 1);
  const cols = [];
  const tableKey = Object.keys(dataSource).find((key) => key.startsWith('table'));
  const dataItem = dataSource[tableKey][0];
  Object.keys(dataItem).forEach((key) => {
    if (key === '创建人' || key.startsWith('_')) return;
    cols.push(new GC.Spread.Sheets.Tables.TableColumn(cols.length, key));
  });
  cols.push(new GC.Spread.Sheets.Tables.TableColumn(cols.length, '创建人'));
  table.bind(cols, table.name(), dataSource[table.name()]);
  sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(dataSource));
  // autoMerge(sheet, table, [cols.length - 1]);
  sheet.resumeCalcService(true);
  sheet.resumePaint();
};
