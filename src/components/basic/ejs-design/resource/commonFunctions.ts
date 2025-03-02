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
  const table = sheet.tables.findByName('table');
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

// 获取选中的区域
export function getRangeValue(ranges, selectType) {
  if (!ranges || ranges.length === 0) {
    return '';
  }
  if (ranges.length > 1) {
    store.selections[selectType] = '';
    showAlert('只允许选择单个Sheet页区域', 'error'); // 错误提示
    return '';
  }
  const selectRanges = ranges[0].ranges;
  if (selectRanges.length === 0) {
    store.selections[selectType] = '';
    return '';
  }
  if (selectRanges.length > 1) {
    store.selections[selectType] = '';
    showAlert('只允许选择单个区域', 'error'); // 错误提示
    return '';
  }
  return selectRanges[0];
}

export function getSpreadSJS() {
  return new Promise((resolve, reject) => {
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
          resolve(pureBase64);
        };
      },
      function (e) {
        console.log('服务器错误: ', e);
        reject(e);
      },
      { includeUnusedNames: false },
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
            initDataSource: JSON.stringify(store.initDataSource),
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
    // store.setInitDataSource(JSON.parse(data.initDataSource));
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
      store.setInitDataSource(JSON.parse(data.initDataSource));
      // 也可以写成 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 等

      // 调用 SpreadJS 的 open 方法
      (store.spread as any).open(
        fileBlob,
        function () {
          store.setOriginalFile(file);
          clearSelections();
          initWorkbook(store.spread);
          (store.spread as any).resumePaint();
          (store.spread as any)
            .getActiveSheet()
            .setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(store.initDataSource));
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
  const table = sheet.tables.findByName('table');
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
  dataSource['table'] = tableData;
  return dataSource;
}
