<template>
  <div class="work-book-container">
    <Teleport to="body" :disabled="!isFullscreen">
      <div class="work-book-content">
        <div class="work-book-operator">
          <!-- <DeptSelecter /> -->
          <a-switch v-model:checked="summaryByType" inline-prompt checked-children="分类汇总" un-checked-children="按行汇总"
            :disabled="summaryByTypeDisabled" @change="switchSummaryType" />
          <a-button type="primary" @click="exportExcel">导出</a-button>
          <a-button type="primary" @click="saveWorkBookData">保存</a-button>
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
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance, nextTick, onMounted, ref, toRaw, watch } from 'vue';
import dayjs from 'dayjs';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import Api from '@/api';
import {
  base64ToArrayBuffer,
  base64ToBlob,
} from '@/components/basic/ejs-design/resource/commonFunctions';
// import { initWorkbook } from '@/components/basic/ejs-design/resource/initWorkbook';
import { initUploadFile } from '@/components/basic/ejs-design/resource/fileUploadCellType';
import { eventBus } from '@/utils/event-bus';
import { attachListColumns } from '@/components/basic/ejs-design/config';
import { TemplateCellType } from '@/components/basic/ejs-design/resource/templateCellType';
const openAttachList = ref(false);
const openPreviewFile = ref(false);
const attachListData = ref<any[]>([]);
const summaryByType = ref(false);
const summaryByTypeDisabled = ref<boolean>(true);
const isFilling = ref(true);
let summarySheetData: any = null;
let summarySheetDataByType: any = null;
/********附件列表模态框v2-begin *********/
const uploadAttachFile = () => {
  eventBus.emit('addAttach');
};

const downloadAttachAll = () => {
  eventBus.emit('downloadAll', attachListData.value);
};
const previewFile = (fileId: string) => {
  eventBus.emit('previewFile', fileId);
};
const downloadFile = async (record: any) => {
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
const deleteFile = async (fileId: string, index: number) => {
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

/********附件列表模态框v2-end *********/
// summaryData 设置非必填
const props = withDefaults(
  defineProps<{ content: { ejs: string; dataSource: any; summaryData: any; summaryDataByType: any; fileName: string; dictData: any[] } }>(),
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
    }),
  },
);
const emits = defineEmits(['saveWorkBook', 'cellClick']);
let spread: any = null;
const isFullscreen = ref(false);
const currentInstance = getCurrentInstance();

const updateAppContainerStyle = () => {
  const appEl: HTMLDivElement =
    currentInstance?.appContext.app._container || document.querySelector('#app');

  appEl.style.setProperty('opacity', isFullscreen.value ? '0' : '1');
  appEl.style.setProperty('visibility', isFullscreen.value ? 'hidden' : 'visible');
  appEl.style.setProperty('position', isFullscreen.value ? 'absolute' : 'relative');
  nextTick(() => {
    spread.addSheet(1, new GC.Spread.Sheets.Worksheet('custom'));
    spread.removeSheet(1);
  });
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
  updateAppContainerStyle();
};

function getSheetTableData(spread: any) {
  const sheet = spread.getActiveSheet();
  return sheet.getDataSource().getSource();
}

function addSheetRows(sheet: any, dataSource: any) {
  // debugger;
  const table = sheet.tables.all()[0];
  const rowCount = table.range().rowCount;
  const tableName = table.name();
  if (dataSource && dataSource[tableName] && dataSource[tableName].length > 0) {
    if (dataSource[tableName].length > rowCount) {
      sheet.addRows(sheet.getRowCount(), dataSource[tableName].length - rowCount + 4);
    }
  }
}

function setSummarySheet(spread: any, summaryData: any) {
  const sheet = spread.getActiveSheet();
  let summarySheet = new GC.Spread.Sheets.Worksheet();
  summarySheet.fromJSON(sheet.toJSON());
  summarySheet.name('汇总表');
  summarySheet.isSelected(false);
  spread.addSheet(spread.getSheetCount() + 1, summarySheet);
  summarySheet = spread.getSheetFromName('汇总表');
  addSheetRows(summarySheet, summaryData);
  summarySheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(summaryData));
}

const renderExcelBySjs = function (ejs: string, dataSource: any = {}, summaryData: any = {}, summaryDataByType: any = {}, dictData: any = {}) {
  return new Promise((resolve, reject) => {
    const arrayBuffer = base64ToArrayBuffer(ejs);
    const fileBlob = new Blob([arrayBuffer], {
      type: 'application/octet-stream',
    });
    spread.open(
      fileBlob,
      function () {
        // clearSelections();
        // initWorkbook(spread);
        console.log('renderExcelBySjs', dictData);
        spread.suspendPaint();
        const sheet = spread.getActiveSheet();
        addSheetRows(sheet, dataSource);
        sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(dataSource));
        // 设置汇总数据
        const tableBindingPath = getSummaryDataTable(summaryDataByType);
        if (tableBindingPath && summaryData[tableBindingPath] && summaryData[tableBindingPath].length > 0) {
          summarySheetData = summaryData;
          summarySheetDataByType = summaryDataByType;
          setSummarySheet(spread, summaryData);
          // 设置汇总表样式
          const summarySheet = spread.getSheetFromName('汇总表');
          summarySheet.tables.all()[0].style('standard');
        }
        spread.setActiveSheet(sheet.name());
        spread.resumePaint();
        initUploadFile(spread);
        setFieldDict(dictData);
        canSwitchSummaryType();
        resolve(true);
      },
      function (e) {
        reject(e);
      },
    );
  });
};

const saveWorkBookEjs = function () {
  spread.save((blob) => {
    // 将 blob 转为 Base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
      const base64data: string = (reader.result as string) || '';
      // base64data 通常带有前缀，如 "data:application/octet-stream;base64,XXXXXXXX"
      // 如果后端只想存储纯粹的 base64，去掉前缀即可：
      const pureBase64 = base64data.split(',')[1];
      emits('saveWorkBook', pureBase64);
    };
  });
};

const getSummaryDataTable = function (summaryData: any) {
  let tableBindingPath = '';
  if (!summaryData) {
    return tableBindingPath;
  }
  Object.keys(summaryData).forEach((key) => {
    if (key.startsWith('table')) {
      tableBindingPath = key;
    }
  });
  return tableBindingPath;
};

const saveWorkBookData = function () {
  const tableData = getSheetTableData(spread);
  emits('saveWorkBook', tableData);
};

const exportExcel = function () {
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
  });
};

const registerEvent = function () {
  console.log('registerEvent');
  const sheet = spread.getActiveSheet();
  sheet.bind(GC.Spread.Sheets.Events.CellClick, function (e, info) {
    const ds = info.sheet.getDataSource().getSource();
    const table = info.sheet.tables.all()[0];
    const tableRange = table.dataRange();
    const tableCol = info.col - tableRange.col;
    const dataField = table.getColumnDataField(tableCol);
    emits('cellClick', {
      row: info.row,
      col: info.col,
      dataField: dataField,
      rowData: ds[table.name()][info.row - tableRange.row - 1],
    });
  });
};

const switchSummaryType = function () {
  const sheet = spread.getSheetFromName('汇总表');
  if (sheet) {
    if (summaryByType.value) {
      sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(summarySheetDataByType));
    } else {
      sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(summarySheetData));
    }
    spread.setActiveSheet(sheet.name());
  }
};

const canSwitchSummaryType = function () {
  const summarySheet = spread.getSheetFromName('汇总表');
  if (summarySheet) {
    summaryByTypeDisabled.value = false;
  } else {
    summaryByTypeDisabled.value = true;
  }
};

/*
  先预处理 dictData 数据， 结果如下：
  {
    'Sheet名称': {
      '字段名称': {
        '字典值': ['字典名称1', '字典名称2', '字典名称3']
      }
    }
  }
*/
const setFieldDict = function (dictData: any) {
  // 预处理 dictData 数据
  if (!dictData || dictData.length === 0) {
    return;
  }
  spread.suspendPaint();
  const sheetDictData = {};
  dictData.forEach((item) => {
    if (!sheetDictData[item['Sheet名称']]) {
      sheetDictData[item['Sheet名称']] = {};
    }
    if (!sheetDictData[item['Sheet名称']][item['字段名称']]) {
      sheetDictData[item['Sheet名称']][item['字段名称']] = [];
    }
    sheetDictData[item['Sheet名称']][item['字段名称']].push(item['可选值']);
  });
  console.log('sheetDictData', sheetDictData);
  const sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    const table = sheet.tables.all()[0];
    const tableRange = table.dataRange();
    const colCount = tableRange.colCount;
    const col = tableRange.col;
    const rowCount = tableRange.rowCount;
    const row = tableRange.row;
    for (let j = 0; j < colCount; j++) {
      const tableCol = table.getColumnDataField(j);
      if (sheetDictData[sheet.name()] && sheetDictData[sheet.name()][tableCol]) {
        const colValues = sheetDictData[sheet.name()][tableCol];
        const comboItems = colValues.map((item) => ({ text: item, value: item }));
        const combo = new GC.Spread.Sheets.CellTypes.ComboBox();
        combo.items(comboItems).editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.text);
        sheet.setCellType(-1, col + j, combo);
      }
    }
    const sheetRowCount = sheet.getRowCount();
    const rowCellType = new TemplateCellType();
    for (let r = 0; r < sheetRowCount; r++) {
      if (r >= row && r < row + rowCount) {
        continue;
      }
      sheet.setCellType(r, -1, rowCellType);
    }
  }
  spread.resumePaint();
};

watch(
  () => props.content,
  (newVal) => {
    renderExcelBySjs(toRaw(newVal.ejs), toRaw(newVal.dataSource), toRaw(newVal.summaryData), toRaw(newVal.summaryDataByType), toRaw(newVal.dictData));
  }
);

onMounted(() => {
  spread = new GC.Spread.Sheets.Workbook('work_book_container');
  // 按照文档是可以直接注册事件，而不是延迟注册，但是实际测试不行，貌似是异步的
  setTimeout(() => {
    eventBus.on('openAttachList', () => {
      console.log('openAttachList');
      openAttachList.value = true;
    });
    eventBus.on('setAttachListData', (data: any[]) => {
      console.log('setAttachListData', data);
      attachListData.value = [...data];
    });
    eventBus.on('openPreviewFileModal', () => {
      openPreviewFile.value = true;
    });
    registerEvent();
  }, 300);
});
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
