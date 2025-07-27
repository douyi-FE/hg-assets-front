import Swal from 'sweetalert2';
import { store } from '../store';
import { downloadUrl, uploadUrl } from '../config';
import { clearSelections } from './initFormulaBar';
import { initWorkbook } from './initWorkbook';

// 显示提示信息
export function showAlert(message, type, timer = 1500) {
  Swal.fire({
    position: 'top',
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: timer,
  });
}

export function promptModal(options: any): any {
  return window.prompt(options.title, options.defaultValue);
}

// 导入模板文件
export function importFile(file) {
  (store.spread as any).suspendPaint();
  (store.spread as any).import(file, () => {
    store.setOriginalFile(file);
    clearSelections(true);
    initWorkbook(store.spread);
    (store.spread as any).resumePaint();
  });
}

// 将设计器中的数据转换为 json 格式
export function spreadToJson() {
  const sheet = (store.spread as any).getActiveSheet();
  const table = sheet.tables.all()[0];
  if (table) {
    table.expandBoundRows(true);
  }
  let json = (store.spread as any).toJSON();
  let designerBindingPathSchema =
    (store.designer as any).getData('treeNodeFromJson') ||
    (store.designer as any).getData('updatedTreeNode') ||
    (store.designer as any).getData('oldTreeNodeFromJson');
  if (designerBindingPathSchema) {
    json.designerBindingPathSchema = JSON.parse(designerBindingPathSchema);
  }
  return json;
}

// 将设计器中的模板转换为 base64 格式
export function spreadToBase64(spread) {
  return new Promise((resolve, reject) => {
    spread = spread || (store.spread as any);
    spread.save(
      async function (blob) {
        const fileBlob = new Blob([blob], { type: 'application/vnd.ms-excel' });
        // 将 fileBlob 转换为 base64
        const base64 = await fileToBase64(fileBlob);
        resolve((base64 as string).split(',')[1]);
      },
      function (e) {
        reject(e);
      },
      { includeBindingSource: true },
    );
  });
}

// 将 base64 加载到设计器中
export function base64ToSpread(base64, callback) {
  (store.spread as any).open(
    base64ToBlob(base64),
    callback,
    function (e) {
      console.log('加载模板出错 ============= >>> ', e);
    },
    {
      dynamicReferences: false,
      calcOnDemand: true,
      incrementalCalculation: true,
      openMode: GC.Spread.Sheets.OpenMode.incremental,
      includeUnusedStyles: false,
      ignoreFormula: true,
    },
  );
}

// base64 转 blob
export function base64ToBlob(base64) {
  const byteString = atob(base64);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: 'application/octet-stream' });
}

// 文件转 base64
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

// 返回初始化数据(支持多表填报)
export function getInitData() {
  const spread = store.spread;
  if (!spread) {
    return {};
  }
  const sheetCount = spread.getSheetCount();
  let initData = {};
  let hasData = false;
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    const ds = sheet.getDataSource();
    if (ds) {
      const dsSource = ds.getSource();
      initData[sheet.name()] = dsSource;
    }
    // 同时判断是否有有效表格存在
    const table = sheet.tables.all()[0];
    if (table && table.bindingPath()) {
      hasData = true;
    }
  }
  return hasData ? initData : false;
}

// 获取选中的区域
export function getRangeValue(ranges) {
  if (!ranges || ranges.length === 0) {
    return '';
  }
  if (ranges.length > 1) {
    showAlert('只允许选择单个Sheet页区域', 'error'); // 错误提示
    return '';
  }
  const selectRanges = ranges[0].ranges;
  if (selectRanges.length === 0) {
    return '';
  }
  if (selectRanges.length > 1) {
    showAlert('只允许选择单个区域', 'error'); // 错误提示
    return '';
  }
  return selectRanges[0];
}

export function getSpreadSJS(spreadjs = null, options: any = {}) {
  const spread = store.spread || spreadjs;
  if (!spread) {
    return Promise.reject('spread is null');
  }
  return new Promise((resolve, reject) => {
    (spread as any).save(
      (blob) => {
        // 将 blob 转为 Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
          const base64data: string = (reader.result as string) || '';
          // base64data 通常带有前缀，如 "data:application/octet-stream;base64,XXXXXXXX"
          // 如果后端只想存储纯粹的 base64，去掉前缀即可：
          const pureBase64 = base64data.split(',')[1];
          resolve(pureBase64);
        };
      },
      function (e) {
        console.log('服务器错误: ', e);
        reject(e);
      },
      { includeUnusedNames: false, ...options },
    );
  });
}
// 保存模板
export function saveTemplate() {
  (store.spread as any).save(
    (blob) => {
      // 将 blob 转为 Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data: string = (reader.result as string) || '';
        // base64data 通常带有前缀，如 "data:application/octet-stream;base64,XXXXXXXX"
        // 如果后端只想存储纯粹的 base64，去掉前缀即可：
        const pureBase64 = base64data.split(',')[1];

        // 发给后端
        fetch(uploadUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: store.originalFile ? (store.originalFile as File).name : '',
            base64: pureBase64,
            initDataSource: JSON.stringify(getInitData()),
          }),
        })
          .then((response) => response.json())
          .then((result) => {
            console.log('Upload result:', result);
            showAlert('保存成功!', 'success');
          })
          .catch((err) => console.error('保存失败: ', err));
      };
    },
    function (e) {
      console.log('服务器错误: ', e);
    },
    { includeUnusedNames: false },
  );
}

// 将 Base64 解码为二进制数组
export function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64); // 解码 base64
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function openTemplateByBase64(base64: string, fileName: string) {
  return new Promise((resolve, reject) => {
    const arrayBuffer = base64ToArrayBuffer(base64);
    const fileBlob = new Blob([arrayBuffer], {
      type: 'application/octet-stream',
    });
    const file = new window.File([fileBlob], fileName, {
      type: 'application/octet-stream',
    });
    // 也可以写成 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 等
    (store.spread as any).open(
      fileBlob,
      function () {
        store.setOriginalFile(file);
        // clearSelections();
        (store.spread as any).suspendPaint();
        initWorkbook(store.spread);
        (store.spread as any).resumePaint();
        resolve(true);
      },
      function (e) {
        reject(e);
      },
    );
  });
}

// 打开模板
export function openTemplate() {
  // 点击按钮后，从后台获取指定 ID 的附件，并加载到 SpreadJS
  // 发请求到后端，获取 base64Data
  fetch(`${downloadUrl}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('附件未找到或发生其他错误。');
      }
      return response.json();
    })
    .then((data) => {
      // data: { id, filename, base64Data }
      const arrayBuffer = base64ToArrayBuffer(data.base64Data);
      // 构建一个 Blob 对象；注意 type 可以根据你的文件类型来设
      const fileBlob = new Blob([arrayBuffer], {
        type: 'application/octet-stream',
      });
      const file = new window.File([fileBlob], data.filename, {
        type: 'application/octet-stream',
      });
      // 也可以写成 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 等

      // 调用 SpreadJS 的 open 方法
      (store.spread as any).open(
        fileBlob,
        function () {
          store.setOriginalFile(file);
          clearSelections();
          initWorkbook(store.spread);
          (store.spread as any).resumePaint();
          // (store.spread as any)
          //   .getActiveSheet()
          //   .setDataSource(
          //     new GC.Spread.Sheets.Bindings.CellBindingSource(getInitData(store.spread)),
          //   );
          const sheetCount = (store.spread as any).getSheetCount();
          const initData = getInitData();
          for (let i = 0; i < sheetCount; i++) {
            const sheet = (store.spread as any).getSheet(i);
            sheet.setDataSource(
              new GC.Spread.Sheets.Bindings.CellBindingSource(JSON.parse(initData)[sheet.name()]),
            );
          }
          showAlert('文件加载成功!', 'success');
        },
        function (e) {
          console.error('文件打开失败', e);
        },
      );
    })
    .catch((err) => {
      console.error(err);
      showAlert('获取附件失败: ' + err.message, 'error');
    });
}

// 初始化表单数据
export function getInitDataSource() {
  const sheet = (store.spread as any).getActiveSheet();
  const bindingPaths = getSheetBindingPaths(sheet);
  const table = sheet.tables.all()[0];
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
        const item: any = {};
        for (let j = 0; j < data[i].length; j++) {
          if (!hasData && data[i][j]) {
            hasData = true;
          }
          item[table.getColumnDataField(j)] = data[i][j];
        }
        tableData.push(item);
      }
    }
    // 将表格数据添加到数据源中
    dataSource[table.name()] = tableData;
  }
  if (hasData) {
    showAlert(
      '表单中已存在的数据将作为初始化数据加载到填报表中，如不需要，请删除数据',
      'success',
      3000,
    );
  }
  dataSource[bindingPaths['tableBindingPath'].tableName] = tableData;
  return dataSource;
}

// 获取 sheet 的绑定信息(支持多表填报)
export function getSheetBindingPaths(sheet) {
  const rowCount = sheet.getRowCount();
  const colCount = sheet.getColumnCount();
  const result = {};
  for (let r = 0; r < rowCount; r++) {
    for (let c = 0; c < colCount; c++) {
      const bp = sheet.getBindingPath(r, c);
      if (bp) {
        const range = new GC.Spread.Sheets.Range(r, c, 1, 1);
        result[bp] = {
          range: range,
          rangeText:
            '=' +
            sheet.name() +
            '!' +
            GC.Spread.Sheets.CalcEngine.rangeToFormula(
              range,
              0,
              0,
              GC.Spread.Sheets.CalcEngine.RangeReferenceRelative.allRelative,
            ),
        };
      }
    }
  }
  const tables = sheet.tables.all();
  if (tables && tables.length > 0) {
    const table = tables[0];
    if (table.bindingPath()) {
      result['tableBindingPath'] = {
        tableName: table.name(),
        range: table.range(),
        bindingPath: table.bindingPath(),
      };
    }
  }
  return result;
}

// 生成 UUID 方法
export function generateUUID() {
  return Math.random().toString(36).substring(2, 15);
}

// 生成表格名称
export function generateTableName() {
  return 'table_' + generateUUID();
}

export function setChineseFont(config) {
  // 配置中文字体
  const fontFamilyCmd = GC.Spread.Sheets.Designer.getCommand('fontFamily');
  const customCNFont = [
    { value: '微软雅黑', text: '微软雅黑' },
    { value: '黑体', text: '黑体' },
    { value: '新宋体', text: '新宋体' },
    { value: '仿宋', text: '仿宋' },
    { value: '隶书', text: '隶书' },
    { value: '楷体', text: '楷体' },
  ];
  fontFamilyCmd.dropdownList = customCNFont.concat(fontFamilyCmd.dropdownList);
  config.commandMap.fontFamily = fontFamilyCmd;
  return config;
}
