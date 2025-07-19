import { message, Modal } from 'ant-design-vue';

export function setTableColumn(sheet) {
  if (!sheet) {
    message.error('未找到有效 sheet 表单');
    return;
  }
  const table = sheet.tables.all()[0];
  if (!table) {
    message.error('请先添加表格');
    return;
  }
  // 提示是否应用到整表
  Modal.confirm({
    title: '提示',
    content: '是否将表格第一行样式和公式应用到整表？',
    okText: '确定',
    cancelText: '取消',
    onOk: () => {
      applyTableStyle(sheet, table);
    },
  });
}

function applyTableStyle(sheet, table) {
  sheet.suspendPaint();
  sheet.suspendCalcService();
  const dataRange = table.dataRange();
  const firstRow = dataRange.row;
  const firstCol = dataRange.col;
  const colCount = dataRange.colCount;
  const rowCount = dataRange.rowCount;
  for (let col = firstCol; col < firstCol + colCount; col++) {
    const style = sheet.getActualStyle(firstRow, col);
    // 先清空单元格样式
    for (let row = firstRow; row < firstRow + rowCount; row++) {
      sheet.setStyle(row, col, null);
    }
    const formula = sheet.getFormula(firstRow, col);
    table.columnLayoutStyle(col, {
      data: style,
    });
    if (formula) {
      table.setColumnDataFormula(col, formula);
    }
  }
  sheet.resumeCalcService(true);
  sheet.resumePaint();
}
