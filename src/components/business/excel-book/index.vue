<template>
  <div class="work-book-container">
    <Teleport to="body" :disabled="!isFullscreen">
      <div class="work-book-content">
        <div class="work-book-operator">
          <!-- <DeptSelecter /> -->
          <a-switch v-model:checked="summaryByType" inline-prompt checked-children="分类汇总" un-checked-children="按行汇总"
            :disabled="summaryByTypeDisabled" @change="switchSummaryType" />

          <a-button type="default" @click="addDicts" v-if="hasDict && isEditable">添加字典</a-button>
          <a-button type="default" @click="updateDicts" v-if="hasDict && isEditable">更新字典</a-button>
          <a-button type="default" @click="exportExcel">导出</a-button>
          <a-button type="default" @click="openImportDialog">导入</a-button>
          <a-button type="primary" @click="saveWorkBookData" :disabled="!isEditable">保存</a-button>
          <FullscreenOutlined v-if="!isFullscreen" @click="toggleFullscreen" />
          <FullscreenExitOutlined v-else @click="toggleFullscreen" />
        </div>
        <input id="uploadFileInput" type="file" style="display: none" multiple />
        <div id="work_book_container" class="work-book-container" />
      </div>
    </Teleport>

    <!-- 附件列表模态框v2 -->
    <a-modal v-model:open="openAttachList" title="附件列表" width="800px" :destroyOnClose="true" :footer="false">
      <div style="display: flex; gap: 10px; padding-bottom: 10px">
        <a-button type="primary" @click="uploadAttachFile">添加附件</a-button>
        <a-button @click="downloadAttachAll">下载全部</a-button>
      </div>
      <a-table :columns="attachListColumns" :dataSource="attachListData" :pagination="false"
        style="height: calc(100vh - 600px)">
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'fileTime'">
            <span>{{ dayjs(record.fileTime).format('YYYY-MM-DD HH:mm:ss') }}</span>
          </template>
          <template v-if="column.dataIndex === 'fileSize'">
            <span>{{ (record.fileSize / 1024).toFixed(2) + 'KB' }}</span>
          </template>
          <template v-if="column.dataIndex === 'action'">
            <a-button type="link" @click="previewFile(record.fileId)">预览</a-button>
            <a-button type="link" @click="downloadFile(record)">下载</a-button>
            <a-popconfirm v-if="isFilling" title="确定删除该附件吗？" @confirm="deleteFile(record.fileId, index)"
              @cancel="() => { }">
              <a-button type="link">删除</a-button>
            </a-popconfirm>
          </template>
        </template>
      </a-table>
    </a-modal>

    <!-- 文件预览模态框v2 -->
    <a-modal v-model:open="openPreviewFile" title="文件预览" width="60%" :destroyOnClose="true" :footer="false"
      wrapClassName="viewContainer">
      <div id="viewContainer" style="height: calc(100vh - 600px)" />
    </a-modal>

    <!-- 导入模态窗, 宽度为视窗的宽度80%，打开完成后回调, 关闭后销毁 -->
    <a-modal v-model:open="openImportModal" title="导入数据" width="80%" :destroyOnClose="true" :footer="false">
      <div style="display: flex; gap: 10px; padding-bottom: 10px">
        <!-- 打开文件按钮，点击后打开文件选择窗口，选中 Excel 后直接用SpreadJS打开 -->
        <a-button @click="openExcelFile">打开文件</a-button>
        <a-popconfirm :title="`将当前选中sheet数据导入到表【${activeSheet.name()}】，是否继续？`" ok-text="是" cancel-text="否"
          @confirm="importExcel" @cancel="() => { }">
          <a-button type="primary">导入</a-button>
        </a-popconfirm>
        <a-button @click="downloadTemplate">下载模板</a-button>
      </div>
      <div>
        <div id="importSpread" class="import-spread"></div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, watch, nextTick } from 'vue';
import dayjs from 'dayjs';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { base64ToArrayBuffer, base64ToBlob } from '@/components/basic/ejs-design/resource/commonFunctions';
import { initWorkbook } from '@/components/basic/ejs-design/resource/initWorkbook';
import { initUploadFile } from '@/components/basic/ejs-design/resource/fileUploadCellType';
import { eventBus } from '@/utils/event-bus';
import { attachListColumns } from '@/components/basic/ejs-design/config';
import { addFieldDict, setFieldDict, updateDict } from './customFieldDict';
import { initCustomInsertRows } from './customInsertRows';
import { getSummaryDataTable, setSummarySheet, canSwitchSummaryType } from './addSummarySheet';
import { exportToExcel, getSheetTableData, addSheetRows, updateAppContainerStyle, protectSheet } from './commonFuncs';
import { fillTableRows } from '@/components/basic/ejs-design/resource/tableRowChanged';
import Api from '@/api';
const openAttachList = ref(false);
const openPreviewFile = ref(false);
const openImportModal = ref(false);
const attachListData = ref<any[]>([]);
const summaryByType = ref(false);
const summaryByTypeDisabled = ref<boolean>(true);
const hasDict = ref(false);
const isFilling = ref(true);
const isEditable = ref(true);
const dictDataFields = ref<any>({});
let summarySheetData: any = null;
let summarySheetDataByType: any = null;
let activeSheet: any = null;

// summaryData 设置非必填
const props = withDefaults(
  defineProps<{ content: { ejs: string; dataSource: any; summaryData: any; summaryDataByType: any; fileName: string; dictData: any[]; editable: boolean; hasDict: boolean } }>(),
  {
    content: () => ({
      ejs: '',
      dataSource: {
        // table: [],
      },
      summaryData: {
        // table: [],
      },
      summaryDataByType: {
        // table: [],
      },
      fileName: '导出数据文件.xlsx',
      dictData: [],
      editable: true,
      hasDict: false,
    }),
  },
);
const emits = defineEmits(['saveWorkBook', 'cellClick']);
let spread: any = null;
const isFullscreen = ref(false);

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  updateAppContainerStyle(spread, isFullscreen);
};

const renderExcelBySjs = function (ejs: string, dataSource: any = {}, summaryData: any = {}, summaryDataByType: any = {}, dictData: any = {}, editable: boolean = true, hasDict: boolean = false) {
  return new Promise((resolve, reject) => {
    const arrayBuffer = base64ToArrayBuffer(ejs);
    const fileBlob = new Blob([arrayBuffer], {
      type: 'application/octet-stream',
    });
    spread.open(
      fileBlob,
      function () {
        // clearSelections();
        if (editable !== undefined) {
          isEditable.value = editable;
        }
        spread.suspendPaint();
        const sheet = spread.getActiveSheet();
        if (dataSource && typeof dataSource === 'string') {
          try {
            dataSource = JSON.parse(dataSource);
          } catch (error) {
            dataSource = {};
          }
        }
        addSheetRows(sheet, dataSource);
        let ds = dataSource[sheet.name()];
        if (ds && typeof ds === 'string') {
          try {
            ds = JSON.parse(ds);
          } catch (error) {
            ds = {};
          }
        }
        if (ds && !ds.project) {
          ds.project = dataSource.project;
          ds.device = dataSource.device;
          ds.engineer = dataSource.engineer;
        }
        sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(ds));
        // 设置汇总数据
        const tableBindingPath = getSummaryDataTable(summaryDataByType);
        if (tableBindingPath && Object.keys(tableBindingPath).length > 0) {
          //TODO 存在多表数据时，暂时只取一个
          summarySheetData = summaryData[Object.keys(tableBindingPath)[0]];
          summarySheetDataByType = summaryDataByType[Object.keys(tableBindingPath)[0]];
          setSummarySheet(spread, summarySheetData);
          if (!editable) {
            // 激活汇总表
            spread.setActiveSheet(spread.getSheetFromName('汇总表').name());
            // 保护所有表
            protectSheet(spread, true);
          }
          // 设置汇总表样式
          const summarySheet = spread.getSheetFromName('汇总表');
          summarySheet.tables.all()[0].style('standard');
        }
        // spread.setActiveSheet(sheet.name());
        spread.resumePaint();
        initUploadFile(spread);
        setFieldDict(spread, dictData, dictDataFields);
        canSwitchSummaryType(spread, summaryByTypeDisabled);
        initWorkbook(spread, (spread) => {
          initCustomInsertRows(spread);
        });
        sheet.recalcAll(true);
        resolve(true);
      },
      function (e) {
        reject(e);
      },
    );
  });
};

const downloadAttachAll = async () => {
  const list = attachListData.value
  const fileName = '文件包.zip'
  const fileIds = list.map((item: any) => item.fileId);
  const response = await Api.templateAttach.downloadZip({
    fileIds: fileIds,
    fileName: fileName,
  });
  if (response && response.data) {
    const fileBlob = new Blob([new Uint8Array(response.data)], { type: 'application/zip' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileBlob);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  } else {
    message.error('下载失败');
  }
};

const saveWorkBookData = function () {
  const tableData = getSheetTableData(spread);
  emits('saveWorkBook', tableData);
};

const exportExcel = function (withData: boolean = true) {
  exportToExcel(spread, props, withData);
};

// 打开导入模态窗
const openImportDialog = function () {
  openImportModal.value = true;
  activeSheet = spread.getActiveSheet();
};

// 监听模态窗口的打开状态
watch(openImportModal, (newVal) => {
  if (newVal) {
    nextTick(() => {
      new GC.Spread.Sheets.Workbook('importSpread');
    });
  }
});

// 打开Excel文件
const openExcelFile = function () {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = false;
  input.accept = '.xlsx';
  input.onchange = function (e: any) {
    const file = e.target.files[0];
    const wb = GC.Spread.Sheets.findControl('importSpread');
    wb.import(file, () => {
      // 
    });
  };
  input.click();
};

// 导入excel
const importExcel = function () {
  const wb = GC.Spread.Sheets.findControl('importSpread');
  if (wb) {
    const sheet = wb.getActiveSheet();
    if (sheet && activeSheet) {
      // 先获取模板的数据起点和列范围
      const table = activeSheet.tables.all()[0];
      const tableDataRange = table.dataRange();
      const startRow = tableDataRange.row;
      const startColumn = tableDataRange.col;
      const endColumn = tableDataRange.col + tableDataRange.colCount;
      // 再获取导入数据的有效数据范围
      const usedRange = sheet.getUsedRange(GC.Spread.Sheets.UsedRangeType.data);
      if (!usedRange) {
        message.warning('未找到有效数据区域，请检查');
        return;
      }
      const row = usedRange.row;
      const column = usedRange.col;
      const rowCount = usedRange.rowCount;
      const columnCount = usedRange.colCount;
      // 校验数据区域有效性
      if (row + rowCount < startRow || column + columnCount < endColumn) {
        message.warning('导入数据区域与模板数据区域不匹配，请检查');
      } else {
        const importData = sheet.getArray(startRow, startColumn, rowCount, endColumn);
        const importDataSource: any[] = [];
        if (importData.length > 0) {
          const tableFields: string[] = [];
          for (let i = 0; i < tableDataRange.colCount; i++) {
            tableFields.push(table.getColumnDataField(i));
          }
          importData.forEach((item: any) => {
            const importItem: any = {};
            item.forEach((field: any, index: number) => {
              if (tableFields[index]) {
                importItem[tableFields[index]] = field;
              }
            });
            importDataSource.push(importItem);
          });
        }
        debugger;
        activeSheet.suspendPaint();
        table.showFooter(false);
        const fromRow = tableDataRange.row + tableDataRange.rowCount;
        activeSheet.addRows(fromRow, rowCount);
        fillTableRows(activeSheet.getParent(), activeSheet, table.dataRange(), fromRow, rowCount);
        // 追加到表格数据源中
        const sheetData = activeSheet.getDataSource().getSource();
        Object.keys(sheetData).forEach((key: string) => {
          if (key.startsWith('table')) {
            // 从 fromRow 开始替换数据
            sheetData[key].splice(fromRow, rowCount, ...importDataSource);
          }
        });
        activeSheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(sheetData));
        table.showFooter(true);
        activeSheet.resumePaint();
        // 关闭模态窗口
        openImportModal.value = false;
      }
    } else {
      message.warning('未找到有效表单，请检查');
    }
  } else {
    message.warning('请先打开导入模态窗');
  }
};

// 下载模板
const downloadTemplate = function () {
  exportExcel(false);
};

const switchSummaryType = function () {
  const sheet = spread.getSheetFromName('汇总表');
  if (sheet) {
    if (summaryByType.value) {
      sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(summarySheetDataByType));
    } else {
      sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(summarySheetData));
    }
    // spread.addCustomFunction(new Evaluate());
    spread.setActiveSheet(sheet.name());
  }
};

const updateDicts = async function () {
  await updateDict(spread, dictDataFields, props.content.fileName);
};

const addDicts = async function () {
  await addFieldDict(spread, dictDataFields, props.content.fileName);
};

watch(
  () => props.content,
  (newVal) => {
    renderExcelBySjs(toRaw(newVal.ejs), toRaw(newVal.dataSource), toRaw(newVal.summaryData), toRaw(newVal.summaryDataByType), toRaw(newVal.dictData), newVal.editable);
  }
);

onMounted(() => {
  spread = new GC.Spread.Sheets.Workbook('work_book_container');
  // 按照文档是可以直接注册事件，而不是延迟注册，但是实际测试不行，貌似是异步的
  setTimeout(() => {
    eventBus.on('openAttachList', () => {
      openAttachList.value = true;
    });
    eventBus.on('setAttachListData', (data: any[]) => {
      attachListData.value = [...data];
    });
    eventBus.on('openPreviewFileModal', () => {
      openPreviewFile.value = true;
    });
    eventBus.on('openImportModal', () => {
      openImportModal.value = true;
    });
    // registerEvent(spread, emits);
  }, 300);
  isEditable.value = props.content.editable === undefined ? true : props.content.editable;
  hasDict.value = props.content.hasDict === undefined ? false : props.content.hasDict;
  if (!isEditable.value) {
    hasDict.value = false;
  }
});


const uploadAttachFile = () => {
  eventBus.emit('addAttach');
};

const previewFile = (fileId) => {
  eventBus.emit('previewFile', fileId);
};
const downloadFile = async (record) => {
  // 下载文件
  const response = await Api.templateAttach.download({
    fileId: record.fileId,
  });
  if (response && response._doc) {
    const file = await response._doc.fileContent;
    const fileBlob = base64ToBlob(file);
    const fileName = record.originalFileName;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(fileBlob);
    a.download = fileName;
    a.click();
  } else {
    message.error('下载失败');
  }
};

const deleteFile = async (fileId, index) => {
  try {
    await Api.templateAttach.deleteFile({
      fileId: fileId,
    });
    attachListData.value.splice(index, 1);
    eventBus.emit('deleteFile', attachListData.value);
    message.success('删除成功');
  } catch (error) {
    message.error('删除失败');
  }
};

</script>

<style lang="less" scoped>
.work-book-container {
  height: 100%;
}

.work-book-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;

  .work-book-operator {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #fff;
    gap: 10px;
  }

  .work-book-container {
    flex-grow: 1;
    border: 1px solid;
  }
}
</style>

<style lang="less" scoped>
.import-spread {
  width: 100%;
  height: calc(100vh - 300px);
}
</style>
