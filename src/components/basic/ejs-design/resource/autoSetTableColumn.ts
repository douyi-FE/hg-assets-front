import { store } from '../store';

// 自动设置表单列
export function setAutoSetTableColumn() {
  (store.spread as any).commandManager().addListener('anyscLicenser', function () {
    if (store.autoSetTableColumn) {
      for (let i = 0; i < arguments.length; i++) {
        const cmd = arguments[i].command;
        if (cmd) {
          const activeRowIndex = cmd.activeRowIndex;
          const activeColIndex = cmd.activeColIndex;
          const selections = cmd.selections;
          const sheet = (store.spread as any).getActiveSheet();
          if (cmd.cmd === 'Designer.setFormatDialog') {
            const style = sheet.getStyle(activeRowIndex, activeColIndex);
            if (selections.length > 0) {
              (store.spread as any).suspendPaint();
              selections.forEach((range) => {
                setTableColumn(range, style, 'style');
              });
              (store.spread as any).resumePaint();
            }
          } else if (cmd.cmd === 'Designer.setDataValidation') {
            const validation = sheet.getDataValidator(activeRowIndex, activeColIndex);
            if (selections.length > 0) {
              (store.spread as any).suspendPaint();
              selections.forEach((range) => {
                setTableColumn(range, validation, 'validation');
              });
              (store.spread as any).resumePaint();
            }
          }
        }
      }
    }
  });
}

function setTableColumn(range, setting, type) {
  const sheet = (store.spread as any).getActiveSheet();
  const table = sheet.tables.findByName('table');
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
