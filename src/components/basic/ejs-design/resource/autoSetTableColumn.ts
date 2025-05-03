import { store } from '../store';

// 自动设置表单列
export function setAutoSetTableColumn(spread: any) {
  spread.commandManager().addListener('anyscLicenser', function () {
    if (store.autoSetTableColumn) {
      for (let i = 0; i < arguments.length; i++) {
        const cmd = arguments[i].command;
        if (cmd) {
          const activeRowIndex = cmd.activeRowIndex;
          const activeColIndex = cmd.activeColIndex;
          const selections = cmd.selections;
          const sheet = spread.getActiveSheet();
          if (cmd.cmd === 'Designer.setFormatDialog') {
            const style = sheet.getStyle(activeRowIndex, activeColIndex);
            if (selections.length > 0) {
              spread.suspendPaint();
              selections.forEach((range) => {
                setTableColumn(spread, range, style, 'style');
              });
              spread.resumePaint();
            }
          } else if (cmd.cmd === 'Designer.setDataValidation') {
            const validation = sheet.getDataValidator(activeRowIndex, activeColIndex);
            if (selections.length > 0) {
              spread.suspendPaint();
              selections.forEach((range) => {
                setTableColumn(spread, range, validation, 'validation');
              });
              spread.resumePaint();
            }
          }
        }
      }
    }
  });
}

function setTableColumn(spread, range, setting, type) {
  const sheet = spread.getActiveSheet();
  const table = sheet.tables.all()[0];
  if (table) {
    const tableRange = table.dataRange();
    const intersection = tableRange.getIntersect(range);
    if (intersection) {
      // 给表格列设置样式
      const row = tableRange.row;
      const rowCount = tableRange.rowCount;
      if (type === 'style') {
        for (let i = 0; i < rowCount; i++) {
          sheet.setStyle(row + i, range.col, setting);
        }
      } else if (type === 'validation') {
        for (let i = 0; i < rowCount; i++) {
          sheet.setDataValidator(row + i, range.col, setting);
        }
      }
    }
  }
}
