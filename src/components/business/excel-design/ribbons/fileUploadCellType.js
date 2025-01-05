// 文件上传单元格类型
function FileUploadCellType() {
  GC.Spread.Sheets.CellTypes.HyperLink.apply(this, arguments);
  this.typeName = 'FileUploadCellType';
}
FileUploadCellType.prototype = new GC.Spread.Sheets.CellTypes.HyperLink();
FileUploadCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
  const sheet = context.sheet;
  const val = sheet.getValue(context.row, context.col);
  style.hAlign = GC.Spread.Sheets.HorizontalAlign.center;
  style.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  if (val === null || val === undefined || val.length === 0) {
    GC.Spread.Sheets.CellTypes.HyperLink.prototype.paint.apply(this, [
      ctx,
      '上传',
      x,
      y,
      w,
      h,
      style,
      context,
    ]);
  } else {
    GC.Spread.Sheets.CellTypes.HyperLink.prototype.paint.apply(this, [
      ctx,
      val,
      x,
      y,
      w,
      h,
      style,
      context,
    ]);
  }
};
FileUploadCellType.prototype.processMouseUp = function (hitInfo) {
  const row = hitInfo.row;
  const col = hitInfo.col;
  const sheet = hitInfo.sheet;
  const tag = sheet.getTag(row, col);
  if (tag && tag.length > 0) {
    Swal.fire({
      html: `
            <div class="renderContainer">
                <h4 id="title" style="text-align: left;">预览附件</h4>
                <div class="form-group">
                    <select class="form-control" id="fileSelector" style="margin: 10px 0; width: 100%;">
                    </select>
                </div>
                <div class="viewContainer">
                    <div id="viewContainer" style="height: 95%;"></div>
                </div>
            </div>
        `,
      width: `${window.innerWidth * 0.8}px`, // 设置宽度为视窗宽度的 80%
      heightAuto: false, // 禁用自动高度以手动设置弹窗高度
      focusConfirm: false,
      showConfirmButton: false,
      didOpen: async () => {
        document.getElementById('fileSelector').addEventListener('change', renderViewer);
        clearFileOptions();
        addFileOptions(tag);
        await renderViewer();
      },
      willClose: () => {},
    });
  } else {
    // 上传
    const btnFile = document.getElementById('uploadFileInput');
    btnFile.row = row;
    btnFile.col = col;
    btnFile.click();
  }
};

// 上传完成后事件
export function initUploadFile(workBook) {
  document.getElementById('uploadFileInput').addEventListener('change', async function (event) {
    // 获取上传的文件列表
    const files = event.target.files;
    // 如果有文件
    if (files.length > 0) {
      const btnFile = event.target;
      const row = btnFile.row;
      const col = btnFile.col;
      const tag = [];
      let val = '';
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        const item = {};
        const file = files[i];
        formData.append('files', file);
        const fileExtension = file.name.split('.').pop().toLowerCase();
        item.id = generateUUID();
        item.name = file.name;
        item.type = fileExtension;
        item.size = file.size;
        tag.push(item);
        val += file.name + ', ';
      }
      formData.append('metadata', JSON.stringify(tag));
      try {
        const uploadUrl = import.meta.env.VITE_EXCEL_UPLOAD_ATTACHMENT_URL;
        const response = await fetch(uploadUrl, {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          await response.json();
          // 上传成功后回显
          const sheet = workBook.getActiveSheet();
          if (val && val.length > 0) {
            val = val.substring(0, val.length - 2);
          }
          sheet.setValue(row, col, val);
          sheet.setTag(row, col, tag);
        } else {
          const error = await response.json();
          showAlert(`Error: ${error.message}`, 'error');
        }
      } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
      }
    }
  });
}

// 生成 UUID 方法
function generateUUID() {
  return crypto.randomUUID();
}

// 动态添加文件选项
function addFileOptions(tag) {
  const fileSelector = document.getElementById('fileSelector');
  // 遍历文件列表并添加选项
  tag.forEach((item) => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    fileSelector.appendChild(option);
  });
}

// 清空追加的文件选项（保留默认选项）
function clearFileOptions() {
  clearViewContainer();
  const fileSelector = document.getElementById('fileSelector');
  // 删除所有选项
  fileSelector.innerHTML = '';
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
async function renderViewer() {
  const fileSelector = document.getElementById('fileSelector');
  const fileId = fileSelector.value;
  clearViewContainer();
  // 根据 ID 从后台请求数据
  const fileItem = await getFileById(fileId);
  const fileType = fileItem.type;
  switch (fileType) {
    case '.jpg':
    case '.jpeg':
    case '.png':
    case '.gif':
      renderPic('viewContainer', fileItem.file);
      break;
    case '.docx':
      renderWord('viewContainer', fileItem.file);
      break;
    case '.pdf':
      renderPdf('viewContainer', fileItem.file);
      break;
    case '.xlsx':
      renderExcel('viewContainer', fileItem.file);
      break;
    default:
      showAlert('不支持的格式', 'error');
      break;
  }
}

async function getFileById(fileId) {
  if (!fileId) {
    showAlert('请输入合法ID', 'error');
    return;
  }
  try {
    const downloadUrl = import.meta.env.VITE_EXCEL_DOWNLOAD_ATTACHMENT_URL;
    const response = await fetch(`${downloadUrl}/${fileId}`);
    if (response.ok) {
      const blob = await response.blob();
      const fileName = decodeURIComponent(response.headers.get('X-File-Name'));
      const fileType = response.headers.get('X-File-Type');
      return {
        file: blob,
        name: fileName,
        type: fileType,
      };
    } else {
      const error = await response.json();
      showAlert(`Error: ${error.message}`, 'error');
    }
  } catch (error) {
    showAlert(`Error: ${error.message}`, 'error');
  }
}

// 设置附件列
export function setAttachColumn(range, workBook) {
  const sheet = workBook.getActiveSheet();
  const table = sheet.tables.findByName('table');
  if (!table || table.bindingPath() === null) {
    showAlert('请先设置绑定表格', 'error');
    return;
  }
  const attachCellType = new FileUploadCellType();
  // 如果附件选择在表格中，则设置附件列
  const tableRange = table.dataRange();
  if (tableRange.contains(range.row, range.col)) {
    // 设置表格绑定列
    table.setColumnDataField(range.col, '上传附件');
    // 设置表格单元格类型
    sheet.addSpan(tableRange.row, range.col, tableRange.rowCount, 1);
    sheet.setCellType(tableRange.row, range.col, attachCellType);
    return;
  }
  // 如果附件选择在表格外，则设置附件单元格
  sheet.setBindingPath(range.row, range.col, '上传附件');
  sheet.setCellType(range.row, range.col, attachCellType);
}
