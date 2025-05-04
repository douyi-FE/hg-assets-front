import { store } from '../store';
import { tableRowChanged } from './tableRowChanged';
import { TemplateCellType } from './templateCellType';

// 初始化工作簿
export function initWorkbook(spread) {
  const sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    const defaultStyle = sheet.getDefaultStyle();
    // 设置模板单元格类型
    defaultStyle.cellType = new TemplateCellType();
    // 设置垂直居中
    defaultStyle.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    sheet.setDefaultStyle(defaultStyle);
  }
  // 设置行高自适应
  // const rowCount = sheet.getRowCount();
  // for (let i = 0; i < rowCount; i++) {
  //   sheet.autoFitRow(i);
  // }
  // 设置表格主题样式
  const border = new GC.Spread.Sheets.LineBorder();
  border.color = '#000000';
  border.style = GC.Spread.Sheets.LineStyle.thin;
  const styleInfo = new GC.Spread.Sheets.Tables.TableStyle(
    '#ffffff',
    '#000000',
    'normal normal 12px Calibri',
    border,
    border,
    border,
    border,
    border,
    border,
  );
  const standardTheme = new GC.Spread.Sheets.Tables.TableTheme();
  standardTheme.name('standard');
  standardTheme.wholeTableStyle(styleInfo);
  standardTheme.headerRowStyle(styleInfo);
  standardTheme.firstRowStripStyle(styleInfo);
  standardTheme.firstColumnStripStyle(styleInfo);
  standardTheme.footerRowStyle(styleInfo);
  standardTheme.highlightFirstColumnStyle(styleInfo);
  standardTheme.highlightLastColumnStyle(styleInfo);
  spread.customTableThemes.add(standardTheme);
  // 设置自动应用到整列
  store.setAutoSetTableColumn(true);
  // 监听表格行变化，自动带入列样式
  tableRowChanged(spread);
}
