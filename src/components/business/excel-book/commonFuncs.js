import { getCurrentInstance, nextTick } from 'vue';

const sheetProtectionOptions = {
  allowSelectLockedCells: true,
  allowSelectUnlockedCells: true,
  allowFilter: true,
  allowSort: true,
  allowResizeRows: true,
  allowResizeColumns: true,
  allowEditObjects: true,
  allowDragInsertRows: false,
  allowDragInsertColumns: false,
  allowInsertRows: false,
  allowInsertColumns: false,
  allowDeleteRows: false,
  allowDeleteColumns: false,
  allowOutlineColumns: false,
  allowOutlineRows: false,
};

export const exportToExcel = function (spread, props, withData = true) {
  spread.export((blob) => {
    // 使用 URL 或 webkitURL
    const URL = window.URL || window.webkitURL;
    const link = document.createElement('a');
    const fileName = props.content.fileName || '导出数据文件.xlsx';

    // 设置下载属性
    link.download = fileName;
    link.rel = 'noopener';
    link.href = URL.createObjectURL(blob); // 直接使用原始 blob

    // 如果在同源下，直接触发点击
    if (link.origin === location.origin) {
      setTimeout(() => {
        link.click();
      }, 0);
    }

    // 释放 URL 对象
    setTimeout(() => {
      URL.revokeObjectURL(link.href);
    });
  }, function (e) {
    console.log(e);
  }, {
    fileType: GC.Spread.Sheets.FileType.excel,
    includeBindingSource: withData
  });
};

export const getSheetTableData = function (spread) {
  const sheetCount = spread.getSheetCount();
  const sheetData = {};
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    sheetData[sheet.name()] = sheet.getDataSource().getSource();
  }
  return sheetData;
}

export const saveWorkBookEjs = function (spread, emits) {
  spread.save((blob) => {
    // 将 blob 转为 Base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64data = (reader.result) || '';
      // base64data 通常带有前缀，如 "data:application/octet-stream;base64,XXXXXXXX"
      // 如果后端只想存储纯粹的 base64，去掉前缀即可：
      const pureBase64 = base64data.split(',')[1];
      emits('saveWorkBook', pureBase64);
    };
  });
};

export const registerEvent = function (spread, emits) {
  console.log('registerEvent');
  const sheet = spread.getActiveSheet();
  sheet.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    const ds = info.sheet.getDataSource().getSource();
    const table = info.sheet.tables.all()[0];
    const tableRange = table.dataRange();
    const tableCol = info.col - tableRange.col;
    const dataField = table.getColumnDataField(tableCol);
    const tableKey = Object.keys(ds).find((key) => key.startsWith('table'));
    const rowData = tableKey ? ds[tableKey][info.row - tableRange.row - 1] : null;
    emits('cellClick', {
      row: info.row,
      col: info.col,
      dataField: dataField,
      rowData: rowData,
    });
  });
};

export const addSheetRows = function (sheet, dataSource) {
  const ds = dataSource[sheet.name()];
  if (!ds) {
    return;
  }
  const table = sheet.tables.all()[0];
  const tableName = table.name();
  if (ds[tableName]) {
    const rowCount = table.range().rowCount;
    if (ds[tableName].length > rowCount) {
      sheet.addRows(sheet.getRowCount(), ds[tableName].length - rowCount + 4);
    }
  }
}

export const updateAppContainerStyle = (spread, isFullscreen) => {
  const currentInstance = getCurrentInstance();
  const appEl =
    currentInstance?.appContext.app._container || document.querySelector('#app');

  appEl.style.setProperty('opacity', isFullscreen.value ? '0' : '1');
  appEl.style.setProperty('visibility', isFullscreen.value ? 'hidden' : 'visible');
  appEl.style.setProperty('position', isFullscreen.value ? 'absolute' : 'relative');
  nextTick(() => {
    spread.addSheet(1, new GC.Spread.Sheets.Worksheet('custom'));
    spread.removeSheet(1);
  });
};

export const protectSheet = function (spread, isProtected) {
  const sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    sheet.options.protectionOptions = sheetProtectionOptions;
    sheet.options.isProtected = isProtected;
  }
};