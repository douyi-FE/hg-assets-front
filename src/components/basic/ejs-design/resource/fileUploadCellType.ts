import Swal from 'sweetalert2';

import { store } from '../store';
import { downloadZipUrl } from '../config';
import { fileToBase64, generateUUID, showAlert, base64ToBlob } from './commonFunctions';
import { renderPic, renderWord, renderPdf, renderExcel, renderUnknown } from './fileRenders';
import Api from '@/api/';

// 文件列表列配置
const fileListColInfos = [
  { name: 'fileId', displayName: '文件ID', size: 1 },
  { name: 'originalFileName', displayName: '文件名称', size: '*' },
  { name: 'fileExtension', displayName: '文件类型', size: 80 },
  { name: 'fileSize', displayName: '文件大小', size: 80 },
  { name: 'fileTime', displayName: '上传时间', size: 160 },
  { name: 'operation', displayName: '操作', size: 120 },
];

// 文件列表表单保护配置
const fileListProtectionOptions = {
  allowSelectLockedCells: true,
  allowSelectUnlockedCells: true,
  allowSort: true,
  allowFilter: true,
  allowResizeRows: true,
  allowResizeColumns: true,
};

// 文件上传单元格类型
function FileUploadCellType(this: any) {
  GC.Spread.Sheets.CellTypes.HyperLink.apply(this, arguments);
  this.typeName = 'FileUploadCellType';
  this.text(store.emptyText);
  this.linkToolTip(store.emptyToolTip);
  this.activeOnClick(true);
  this.onClickAction(fileUploadEvent);
}
FileUploadCellType.prototype = new GC.Spread.Sheets.CellTypes.HyperLink();
FileUploadCellType.prototype.paint = function (ctx, val, x, y, w, h, style, context) {
  // const sheet = context.sheet;
  // const val = sheet.getValue(context.row, context.col);
  style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  if (val === null || val === undefined || val.length === 0) {
    GC.Spread.Sheets.CellTypes.HyperLink.prototype.paint.apply(this, [
      ctx,
      store.emptyText,
      x,
      y,
      w,
      h,
      style,
      context,
    ]);
  } else {
    // 把val转为文件名称
    const fileNames = val.map((item) => item.originalFileName);
    // 显示文件名称
    let fileNamesStr = fileNames.join('\n');
    // 如果文件名称字符数量超过10，则只显示前10个字符
    if (fileNamesStr.length > 10) {
      fileNamesStr = fileNamesStr.substring(0, 10);
      fileNamesStr += '...';
    }
    let cellType = style.cellType;
    cellType.text(fileNamesStr);
    cellType.linkToolTip(store.previewToolTip);
    style.wordWrap = true;
    style.hAlign = GC.Spread.Sheets.HorizontalAlign.left;
    style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
    GC.Spread.Sheets.CellTypes.HyperLink.prototype.paint.apply(this, [
      ctx,
      fileNamesStr,
      x,
      y,
      w,
      h,
      style,
      context,
    ]);
  }
};

// 设置附件列
export function setAttachColumn(range, bindingPath = 'fileAttach') {
  const sheet = (store.spread as any).getActiveSheet();
  // 未绑定的表格不允许设置附件
  if (!store.bindingPaths[store.tableName]) {
    showAlert('请先设置绑定', 'error');
    return;
  }
  // 绑定的表格
  const table = sheet.tables.findByName(store.tableName);
  if (!table || table.bindingPath() === null) {
    showAlert('请先设置绑定', 'error');
    return;
  }
  const tableRange = table.dataRange();
  if (tableRange.contains(range.row, range.col)) {
    // 设置表格绑定列
    table.setColumnDataField(range.col, '上传附件');
    // 为每一行设置表格单元格类型
    const rowCount = tableRange.rowCount;
    sheet.suspendPaint();
    for (let i = 0; i < rowCount; i++) {
      let attachCellType = new FileUploadCellType();
      sheet.setCellType(tableRange.row + i, range.col, attachCellType);
      sheet
        .getCell(tableRange.row + i, range.col)
        .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
        .vAlign(GC.Spread.Sheets.VerticalAlign.center);
    }
    sheet.resumePaint();
  } else {
    // 单元格附件
    const row = range.row;
    const col = range.col;
    const rowCount = range.rowCount;
    const colCount = range.colCount;
    sheet.suspendPaint();
    // 如果多选，合并单元格
    if (rowCount > 1 || colCount > 1) {
      sheet.addSpan(row, col, rowCount, colCount);
    }
    // 设置绑定路径
    sheet.setBindingPath(row, col, bindingPath);
    // 设置单元格类型
    let attachCellType = new FileUploadCellType();
    sheet.setCellType(row, col, attachCellType);
    // 设置对齐方式
    sheet
      .getCell(row, col)
      .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
      .vAlign(GC.Spread.Sheets.VerticalAlign.center);
    sheet.resumePaint();
    store.bindingPaths[bindingPath] = {
      range: JSON.parse(JSON.stringify(range)),
      rangeText: bindingPath,
    };
  }
}

// 针对 tableRowChanged 的单元格类型设置
export function setTableRowChangedCellType(range) {
  const sheet = (store.spread as any).getActiveSheet();
  const row = range.row;
  const col = range.col;
  const rowCount = range.rowCount;
  const colCount = range.colCount;
  let attachCellType = new FileUploadCellType();
  for (let i = 0; i < rowCount; i++) {
    for (let j = 0; j < colCount; j++) {
      sheet.setCellType(row + i, col + j, attachCellType);
      sheet
        .getCell(row + i, col + j)
        .hAlign(GC.Spread.Sheets.HorizontalAlign.center)
        .vAlign(GC.Spread.Sheets.VerticalAlign.center);
    }
  }
}

// 上传文件点击事件
function fileUploadEvent(args) {
  const row = args.row;
  const col = args.col;
  const sheet = args.sheet;
  const uploadCellType = args.cellStyle.cellType;
  const val = sheet.getValue(row, col);
  if (val && val.length > 0) {
    // 用 modal 重新实现
    const fileListModal = document.getElementById('fileListModal');
    // 禁止 esc 关闭
    const modal = new Modal({ el: fileListModal }).show();
    document.getElementsByClassName('modal-backdrop')[0].remove();
    const fileList = new GC.Spread.Sheets.Workbook('fileListContainer');
    fileList.options.newTabVisible = false;
    fileList.options.allowUserDragFill = false;
    fileList.options.allowContextMenu = false;
    fileList.options.tabStripVisible = false;
    fileList.options.scrollbarMaxAlign = true;

    // 设置文件列表列
    setFileListColumn(fileList.getActiveSheet(), val);

    // 添加文件按钮事件
    const addFile = document.getElementById('addFile');
    const addFileEvent = () => {
      const fileInput = document.getElementById('uploadFileInput');
      fileInput.row = row;
      fileInput.col = col;
      fileInput.click();
    };
    addFile.addEventListener('click', addFileEvent);

    // 下载全部按钮事件
    const downloadAll = document.getElementById('downloadAll');
    const downloadAllEvent = () => {
      const fileIds = val.map((item) => item.fileId);
      if (fileIds.length === 0) {
        showAlert('请先上传文件', 'error');
        return;
      }
      // 下载文件名称默认为文件包
      const fileName = '文件包.zip';
      window.open(`${downloadZipUrl}?fileIds=${fileIds.join(',')}&fileName=${fileName}`, '_blank');
    };
    downloadAll.addEventListener('click', downloadAllEvent);

    modal.on('hide', function () {
      // 释放SpreadJS
      const fileList = GC.Spread.Sheets.findControl('fileListContainer');
      if (fileList) {
        fileList.destroy();
      }
      // 解绑事件
      addFile.removeEventListener('click', addFileEvent);
      downloadAll.removeEventListener('click', downloadAllEvent);
      // 重绘sheet, 改变的文件数据需要刷新
      sheet.repaint();
    });
  } else {
    // 上传
    uploadCellType.text(store.emptyText);
    uploadCellType.linkToolTip(store.emptyToolTip);
    const btnFile = document.getElementById('uploadFileInput');
    btnFile.row = row;
    btnFile.col = col;
    btnFile.click();
  }
}

// 设置文件列表列
function setFileListColumn(sheet, val) {
  sheet.suspendPaint();
  sheet.options.protectionOptions = fileListProtectionOptions;
  sheet.options.isProtected = true;
  const dataSource = val.map((item) => {
    return {
      fileId: item.fileId,
      originalFileName: item.originalFileName,
      fileExtension: item.fileExtension,
      // 换算成KB
      fileSize: (item.fileSize / 1024).toFixed(2) + 'KB',
      fileTime: new Date(item.fileTime).toLocaleString(),
      operation: '',
    };
  });
  sheet.setDataSource(dataSource);
  sheet.bindColumns(fileListColInfos);
  const defaultStyle = sheet.getDefaultStyle();
  defaultStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  defaultStyle.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  sheet.setDefaultStyle(defaultStyle);
  // 计算出dataSource每一个元素有多少个属性
  const columnCount = Object.keys(dataSource[0]).length;
  // 添加筛选
  const filter = new GC.Spread.Sheets.Filter.HideRowFilter(
    new GC.Spread.Sheets.Range(0, 0, val.length, columnCount - 1),
  );
  sheet.rowFilter(filter);
  // 添加操作按钮
  sheet.setStyle(-1, columnCount - 1, getOperationStyle(val, dataSource));
  sheet.resumePaint();
}

// 创建操作列样式
function getOperationStyle(val, dataSource) {
  // 添加操作按钮
  const operationStyle = new GC.Spread.Sheets.Style();
  operationStyle.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  operationStyle.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  operationStyle.foreColor = 'white';
  operationStyle.fontSize = '11px';
  operationStyle.locked = false;
  const buttons = [
    {
      caption: '预览',
      useButtonStyle: true,
      buttonBackColor: '#008CBA',
      command: async (sheet, row, col, option) => {
        const filePreviewModal = document.getElementById('filePreviewModal');
        // 禁止 esc 关闭
        const modal = new Modal({ el: filePreviewModal }).show();
        document.getElementsByClassName('modal-backdrop')[0].remove();
        await renderViewer(dataSource[row].fileId);
        modal.on('hidden', function () {
          // 释放资源
          clearViewContainer();
        });
      },
    },
    {
      caption: '下载',
      useButtonStyle: true,
      buttonBackColor: '#82BC00',
      command: async (sheet, row, col, option) => {
        // 下载文件
        const response = await Api.templateAttach.download({
          fileId: dataSource[row].fileId,
        });
        if (response && response._doc) {
          const file = await response._doc.fileContent;
          const fileBlob = base64ToBlob(file);
          const fileName = dataSource[row].originalFileName;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(fileBlob);
          a.download = fileName;
          a.click();
        } else {
          showAlert('下载失败', 'error');
          console.log(response);
        }
      },
    },
  ];
  if (isAllowDeleteFile()) {
    buttons.push({
      caption: '删除',
      useButtonStyle: true,
      buttonBackColor: '#F44336',
      command: async (sheet, row, col, option) => {
        // 提醒是否删除
        Swal.fire({
          title: '删除选中文件，是否继续？',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
        }).then(async (result) => {
          if (result.isConfirmed) {
            // 删除文件
            const fileId = dataSource[row].fileId;
            try {
              await Api.templateAttach.deleteFile({
                fileId: fileId,
              });
              dataSource.splice(row, 1);
              // 删除原始数据中对应ID的文件
              val.map((item, index) => {
                if (item.fileId === fileId) {
                  val.splice(index, 1);
                }
              });
              // 重绘sheet
              sheet.repaint();
              // 手动删除最后一行
              sheet.deleteRows(dataSource.length, 1);
              showAlert('删除成功', 'success');
            } catch (error) {
              showAlert('删除失败', 'error');
            }
          }
        });
      },
    });
  }
  operationStyle.cellButtons = buttons;
  return operationStyle;
}

// 初始化模板中已经设置的上传文件单元格
export async function initUploadFile() {
  document.getElementById('uploadFileInput')?.addEventListener('change', async function (event) {
    // 获取上传的文件列表
    const files = event.target.files;
    // 如果有文件
    if (files.length > 0) {
      const btnFile = event.target;
      const row = btnFile.row;
      const col = btnFile.col;
      // 本次上传的数据
      const uploadFiles = [];
      // 当前单元格的值 —— 追加数据
      const sheet = (store.spread as any).getActiveSheet();
      let val = sheet.getValue(row, col);
      // 如果val为空，则初始化val为[]
      if (!val) {
        val = [];
      }

      for (let i = 0; i < files.length; i++) {
        const item = {};
        const file = files[i];
        try {
          let base64 = await fileToBase64(file);
          base64 = base64.split(',')[1];
          item.fileId = generateUUID();
          item.originalFileName = file.name;
          item.fileName = item.fileId + '_' + file.name;
          item.fileContent = base64;
          item.fileExtension = file.name.split('.').pop().toLowerCase();
          item.fileTime = new Date().getTime();
          item.fileSize = file.size;
          // 不含fileContent的附件数据
          val.push({
            fileId: item.fileId,
            originalFileName: item.originalFileName,
            fileName: item.fileName,
            fileExtension: item.fileExtension,
            fileTime: item.fileTime,
            fileSize: item.fileSize,
          });
          // 含fileContent的附件数据
          uploadFiles.push(item);
        } catch (error) {
          console.error('文件转换失败:', error);
          showAlert('文件转换失败', 'error');
          return;
        }
      }
      try {
        // 上传文件
        await Api.templateAttach.upload({
          files: uploadFiles,
        });

        // 上传成功后回显
        const sheet = (store.spread as any).getActiveSheet();
        sheet.setValue(row, col, val);
        // 重新设置文件列表列
        const fileList = GC.Spread.Sheets.findControl('fileListContainer');
        if (fileList) {
          const fileListSheet = fileList.getActiveSheet();
          setFileListColumn(fileListSheet, val);
        }
        showAlert('上传成功', 'success');
      } catch (error) {
        // 处理非200响应
        let errorMessage;
        try {
          errorMessage = error.message || '上传失败';
        } catch (e) {
          errorMessage = '上传失败';
        }
        showAlert(`Error: ${errorMessage}`, 'error');
      }
    }
  });
}

/*
  val 数据结构：
  {
    fileId: '1234567890', // 文件ID: UUID
    originalFileName: 'test.jpg', // 原始文件名
    fileName: '1234567890_test.jpg', // 实际文件名 = fileId + '_' + originalFileName
    fileContent: 'base64', // 文件内容
    fileExtension: 'jpg', // 文件扩展名
    fileTime: 1713333333333, // 文件上传时间
    fileSize: 1024, // 文件大小
  }
*/
// 动态添加文件选项
function addFileOptions(val) {
  const fileSelector = document.getElementById('fileSelector');
  // 遍历文件列表并添加选项
  val.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.fileId;
    option.textContent = item.originalFileName;
    fileSelector.appendChild(option);
  });
}

// 清空预览区域
function clearViewContainer() {
  const viewSpread = GC.Spread.Sheets.findControl('viewContainer');
  if (viewSpread) {
    viewSpread.destroy();
  }
  document.getElementById('viewContainer').innerHTML = '';
}

// 更新预览区域
async function renderViewer(fileId) {
  clearViewContainer();
  // 根据 ID 从后台请求数据
  const fileItem = await getFileById(fileId);
  if (fileItem && fileItem.fileContent) {
    const fileType = fileItem.fileExtension;
    const file = fileItem.fileContent;
    // 将fileContent从base64转为文件
    const fileBlob = base64ToBlob(file);
    switch (fileType) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        renderPic('viewContainer', fileBlob);
        break;
      case 'docx':
        renderWord('viewContainer', fileBlob);
        break;
      case 'pdf':
        renderPdf('viewContainer', fileBlob);
        break;
      case 'xlsx':
        renderExcel('viewContainer', fileBlob);
        break;
      default:
        renderUnknown('viewContainer');
        break;
    }
  } else {
    showAlert(`服务器错误，请稍后再试`, 'error');
  }
}

async function getFileById(fileId) {
  if (!fileId) {
    showAlert('请输入合法ID', 'error');
    return;
  }
  try {
    const response = await Api.templateAttach.findByFileId({
      fileId: fileId,
    });
    if (response && response[0]) {
      return response[0]._doc;
    } else {
      showAlert(`服务器错误，请稍后再试`, 'error');
    }
  } catch (error) {
    showAlert(`服务器错误，请稍后再试`, 'error');
  }
}

// 是否允许删除附件
function isAllowDeleteFile() {
  return !!store.isFilling;
}
