import { nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { store } from '../store';
import { downloadZipUrl } from '../config';
import { fileToBase64, generateUUID, showAlert, base64ToBlob } from './commonFunctions';
import { renderPic, renderWord, renderPdf, renderExcel, renderUnknown } from './fileRenders';
import Api from '@/api/';
import { eventBus } from '@/utils/event-bus';

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
    const addFileEvent = () => {
      const fileInput: any = document.getElementById('uploadFileInput')!;
      fileInput.row = row;
      fileInput.col = col;
      fileInput.click();
    };
    const downloadAllEvent = (list = []) => {
      const fileIds = list.map((item: any) => item.fileId);
      if (fileIds.length === 0) {
        showAlert('请先上传文件', 'error');
        return;
      }
      // 下载文件名称默认为文件包
      const fileName = '文件包.zip';
      window.open(`${downloadZipUrl}?fileIds=${fileIds.join(',')}&fileName=${fileName}`, '_blank');
    };
    const closeDestory = () => {
      // 重绘sheet, 改变的文件数据需要刷新
      sheet.repaint();
    };
    const previewFile = (fileId) => {
      // 打开预览模态框
      eventBus.emit('openPreviewFileModal');
      nextTick(() => {
        // 渲染预览
        renderViewer(fileId);
      });
    };
    const deleteFile = (length) => {
      const sheet = (store.spread as any).getActiveSheet();
      // 重绘sheet
      sheet.repaint();
      // 手动删除最后一行
      sheet.deleteRows(length, 1);
    };
    eventBus.off('downloadAll');
    eventBus.off('addAttach');
    eventBus.off('closeDestory');
    eventBus.off('previewFile');
    eventBus.off('deleteFile');
    eventBus.on('downloadAll', downloadAllEvent);
    eventBus.on('addAttach', addFileEvent);
    eventBus.on('previewFile', previewFile);
    eventBus.on('deleteFile', deleteFile);
    eventBus.emit('openAttachList');
    eventBus.emit('setAttachListData', val);
    eventBus.on('closeDestory', closeDestory);
  } else {
    // 上传
    uploadCellType.text(store.emptyText);
    uploadCellType.linkToolTip(store.emptyToolTip);
    const btnFile: any = document.getElementById('uploadFileInput')!;
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
  sheet.resumePaint();
}

// 初始化模板中已经设置的上传文件单元格
export async function initUploadFile() {
  document
    .getElementById('uploadFileInput')
    ?.addEventListener('change', async function (event: any) {
      // 获取上传的文件列表
      const files = event.target.files;
      // 如果有文件
      if (files.length > 0) {
        const btnFile = event.target;
        const row = btnFile.row;
        const col = btnFile.col;
        // 本次上传的数据
        const uploadFiles: any[] = [];
        // 当前单元格的值 —— 追加数据
        const sheet = (store.spread as any).getActiveSheet();
        let val = sheet.getValue(row, col);
        // 如果val为空，则初始化val为[]
        if (!val) {
          val = [];
        }

        for (let i = 0; i < files.length; i++) {
          const item: any = {};
          const file = files[i];
          try {
            let base64 = await fileToBase64(file);
            base64 = (base64 as string).split(',')[1];
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
          message.success('上传成功');
          // 更新附件列表数据
          eventBus.emit('setAttachListData', val);
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

// 清空预览区域
function clearViewContainer() {
  const viewSpread = GC.Spread.Sheets.findControl('viewContainer');
  if (viewSpread) {
    viewSpread.destroy();
  }
  document.getElementById('viewContainer')!.innerHTML = '';
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
