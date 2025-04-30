import { store } from '../store';
import { showAlert } from './commonFunctions';
import { setAttachColumn } from './fileUploadCellType';

// 处理选中的区域
export function handleRangeValue(range, selectType, area) {
  // 按类型处理
  let sheet = (store.spread as any).getActiveSheet();
  switch (selectType) {
    case 'tableTitle':
      (store.spread as any).suspendPaint();
      bindingTablePath(range);
      (store.spread as any).resumePaint();
      break;
    case 'fileAttach':
      (store.spread as any).suspendPaint();
      setAttachColumn(store.spread, range);
      (store.spread as any).resumePaint();
      break;
    default:
      // 默认情况下，selectType为字段名
      if (store.bindingPaths[selectType]) {
        const range = store.bindingPaths[selectType].range;
        sheet.setBindingPath(range.row, range.col, null);
        // 删除绑定路径后，锁定单元格
        sheet.getCell(range.row, range.col).locked(true);
        store.setBindingPaths({
          ...store.bindingPaths,
          [selectType]: undefined,
        });
      }
      if (range) {
        sheet.setBindingPath(range.row, range.col, selectType);
        // 设置绑定路径后，解锁单元格
        sheet.getCell(range.row, range.col).locked(false);
        store.setInitDataSource({
          ...store.initDataSource,
          [selectType]: undefined,
        });
        store.setBindingPaths({
          ...store.bindingPaths,
          [selectType]: {
            range: JSON.parse(JSON.stringify(range)),
            rangeText: area,
          },
        });
      }
      break;
  }
}

// 绑定表单路径
export function bindingTablePath(range) {
  if (!range || range.rowCount === 0) {
    showAlert('未选中有效表头区域，请重新选择', 'error');
    return;
  }
  if (store.bindingPaths[store.tableName]) {
    showAlert('已绑定表单，请重置后重新绑定', 'error');
    return;
  }
  const sheet = (store.spread as any).getActiveSheet();
  let tables = sheet.tables.all();
  if (tables.length > 0) {
    showAlert('表单中已存在表格，将重置所有表格', 'warning');
    tables.forEach((table) => {
      (store.spread as any).commandManager().execute({
        cmd: 'tableToRange',
        sheetName: sheet.name(),
        tableName: table.name(),
      });
    });
  }
  // 设置冻结行
  sheet.frozenRowCount(range.row + range.rowCount);
  let table: any = null;
  const tableRange = getTableRange(range);
  // 先处理单行表头场景
  if (range.rowCount === 1) {
    // 获取表单字段
    table = sheet.tables.add(
      store.tableName,
      tableRange.row,
      tableRange.col,
      tableRange.rowCount,
      tableRange.colCount,
    );
    table.autoGenerateColumns(false);
    const tableFields = sheet.getArray(range.row, range.col, range.rowCount, range.colCount).flat();
    // 设置表单字段
    const tableColumns: any[] = [];
    tableFields.forEach((field, index) => {
      const tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
      tableColumn.name(field);
      tableColumn.dataField(field);
      tableColumns.push(tableColumn);
    });
    table.bindingPath(store.tableName);
    table.bindColumns(tableColumns);
    // 创建初始化数据对象
    initFillData();
    store.setBindingPaths({
      ...store.bindingPaths,
      table: JSON.parse(JSON.stringify(range)),
    });
  } else if (range.rowCount > 1) {
    // 处理多行表头场景
    // 插入表头行
    sheet.addRows(tableRange.row, 1);
    table = sheet.tables.add(
      store.tableName,
      tableRange.row,
      tableRange.col,
      tableRange.rowCount + 1,
      tableRange.colCount,
    );
    table.allowAutoExpand(true);
    // 插入汇总行
    sheet.addRows(tableRange.row + tableRange.rowCount + 1, 1);
    // sheet.removeSpan(tableRange.row + tableRange.rowCount, -1);
    // 扩展表格区域
    table.autoGenerateColumns(false);
    const row = range.row;
    const col = range.col;
    const colCount = range.colCount;
    const tableColumns: any[] = [];
    for (let i = col; i < col + colCount; i++) {
      const span = sheet.getSpan(row, i);
      // 如果是正常单元格或跨行单元格，则正常处理
      if (!span || span.colCount === 1) {
        const tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
        const field = sheet.getValue(row, i);
        tableColumn.name(field);
        tableColumn.dataField(field);
        tableColumns.push(tableColumn);
      } else {
        // 如果跨列，先填充表头
        const row = span.row;
        const col = span.col;
        const rowCount = span.rowCount;
        const colCount = span.colCount;
        for (let j = 0; j < rowCount; j++) {
          const field = sheet.getValue(row + j, col);
          for (let k = 0; k < colCount; k++) {
            if (!sheet.getValue(row + j, col + k)) {
              sheet.setValue(row + j, col + k, field);
            }
          }
        }
        // 填充完成后，逐级拼接即可
        const tableColumn = new GC.Spread.Sheets.Tables.TableColumn();
        let field = '';
        for (let j = 0; j < range.rowCount; j++) {
          const cellVal = sheet.getValue(row + j, i);
          field += cellVal ? cellVal : '';
        }
        tableColumn.name(field);
        tableColumn.dataField(field);
        tableColumns.push(tableColumn);
        // i += colCount - 1;
      }
    }
    table.bindingPath(store.tableName);
    table.bindColumns(tableColumns);
    // 创建初始化数据对象
    initFillData();
    // 添加多行表头筛选
    addMultiTitleTableFilter();
    // 设置表格数据区域可编辑
    sheet
      .getRange(tableRange.row, tableRange.col, tableRange.rowCount, tableRange.colCount)
      .locked(false);
    store.setBindingPaths({
      ...store.bindingPaths,
      table: JSON.parse(JSON.stringify(table.range())),
    });
  }
  const changedRange = table.range();
  // 添加汇总行
  sheet.addRows(changedRange.row + changedRange.rowCount + 1, 1);
  table.showFooter(true);
  table.useFooterDropDownList(true);
  // 调整汇总行样式
  sheet.setRowHeight(
    changedRange.row + changedRange.rowCount,
    sheet.getRowHeight(changedRange.row + changedRange.rowCount - 1),
  );
  let rowStyle = sheet.getStyle(changedRange.row + changedRange.rowCount, -1);
  if (!rowStyle) {
    rowStyle = new GC.Spread.Sheets.Style();
  }
  rowStyle.font = 'normal normal 16px 仿宋';
  rowStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  sheet.setStyle(changedRange.row + changedRange.rowCount + 1, -1, rowStyle);
  table.style('standard');
  // 设置自动应用到行
  if (!store.autoSetTableColumn) {
    const autoSetTableColumnCommand = GC.Spread.Sheets.Designer.getCommand('AutoSetTableColumn');
    autoSetTableColumnCommand.execute(store.designer);
  }
}

// 处理多行表头的筛选
function addMultiTitleTableFilter() {
  const sheet = (store.spread as any).getActiveSheet();
  const table = sheet.tables.findByName(store.tableName);
  // 保存 table range
  const tableRange = table.range();
  // 隐藏表头
  table.showHeader(false);
  // 删除表头行
  sheet.deleteRows(tableRange.row, 1);
  // 保留原来的列数
  const colCount = sheet.getColumnCount();
  // 扩展一倍的列数
  sheet.setColumnCount(colCount * 2);
  // 隐藏表头筛选
  table.filterButtonVisible(false);

  // 把表移动到后边
  sheet.tables.move(table, tableRange.row, colCount);
  // 设置筛选列，列默认从0开始
  const filter = new GC.Spread.Sheets.Filter.HideRowFilter(
    new GC.Spread.Sheets.Range(
      tableRange.row,
      tableRange.col,
      tableRange.rowCount + 1,
      tableRange.colCount,
    ),
  );
  sheet.rowFilter(filter);
  // 再把表移动回来
  sheet.tables.move(table, tableRange.row, 0);
  // 删掉多余的列
  sheet.setColumnCount(sheet.getColumnCount() / 2);
}

// 初始化表单数据
function initFillData() {
  const sheet = (store.spread as any).getActiveSheet();
  const table = sheet.tables.findByName(store.tableName);
  const dataSource = {};
  const tableData: any[] = [];
  let hasData = false;
  if (table) {
    const dataRange = table.dataRange();
    const data = sheet.getArray(
      dataRange.row,
      dataRange.col,
      dataRange.rowCount,
      dataRange.colCount,
    );
    if (data.length > 0) {
      for (let i = 0; i < data.length; i++) {
        const item = {};
        for (let j = 0; j < data[i].length; j++) {
          if (data[i][j]) {
            hasData = true;
          }
          item[table.getColumnDataField(j)] = data[i][j];
        }
        tableData.push(item);
      }
    }
  }
  if (hasData) {
    showAlert(
      '表单中已存在的数据将作为初始化数据加载到填报表中，如不需要，请删除数据',
      'success',
      3000,
    );
  }
  dataSource[store.tableName] = tableData;
  store.setInitDataSource({
    ...store.initDataSource,
    table: tableData,
  });
  sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(store.initDataSource));
}

// 根据表头区域获取表格区域
function getTableRange(titleRange) {
  const sheet = (store.spread as any).getActiveSheet();
  if (titleRange.rowCount === 1) {
    const rowCount = sheet.getRowCount();
    let bottomRow = titleRange.row + 1;
    for (let i = titleRange.row + 1; i < rowCount; i++) {
      const cell = sheet.getCell(i, titleRange.col);
      // 如果单元格有边框，算有效表格区域
      if (!cell.borderLeft()) {
        bottomRow = i;
        break;
      }
    }
    if (bottomRow > titleRange.row + 1) {
      return new GC.Spread.Sheets.Range(
        titleRange.row,
        titleRange.col,
        bottomRow - titleRange.row,
        titleRange.colCount,
      );
    }
    return titleRange;
  } else {
    // 如果是多行表头，获取表头以下内容区域
    const rowCount = sheet.getRowCount();
    let bottomRow = titleRange.row + titleRange.rowCount;
    for (let i = titleRange.row + titleRange.rowCount; i < rowCount; i++) {
      const cell = sheet.getCell(i, titleRange.col);
      if (cell.borderLeft() || cell.borderRight()) {
        bottomRow = i;
      }
      if (!cell.borderLeft() && !cell.borderRight()) {
        sheet.addRows(i, 1);
        bottomRow = i;
        break;
      }
    }
    return new GC.Spread.Sheets.Range(
      titleRange.row + titleRange.rowCount,
      titleRange.col,
      bottomRow - titleRange.row - titleRange.rowCount,
      titleRange.colCount,
    );
  }
}
