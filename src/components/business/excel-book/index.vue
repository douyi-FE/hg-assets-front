<template>
  <div class="work-book-container">
    <Teleport to="body" :disabled="!isFullscreen">
      <div class="work-book-content">
        <div class="work-book-operator">
          <!-- <DeptSelecter /> -->
          <a-switch v-model:checked="summaryByType" inline-prompt checked-children="分类汇总" un-checked-children="按行汇总"
            :disabled="summaryByTypeDisabled" @change="switchSummaryType" />

          <a-button type="default" @click="addDicts">添加字典</a-button>
          <a-button type="default" @click="updateDicts">更新字典</a-button>
          <a-button type="default" @click="exportExcel">导出</a-button>
          <a-button type="default" @click="importExcel">导入</a-button>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, toRaw, watch } from 'vue';
import dayjs from 'dayjs';
import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { base64ToArrayBuffer } from '@/components/basic/ejs-design/resource/commonFunctions';
import { initWorkbook } from '@/components/basic/ejs-design/resource/initWorkbook';
import { initUploadFile } from '@/components/basic/ejs-design/resource/fileUploadCellType';
import { eventBus } from '@/utils/event-bus';
import { attachListColumns } from '@/components/basic/ejs-design/config';
import { addFieldDict, setFieldDict, updateDict } from './customFieldDict';
import { initCustomInsertRows } from './customInsertRows';
import { getSummaryDataTable, setSummarySheet, canSwitchSummaryType } from './addSummarySheet';
import { exportToExcel, getSheetTableData, registerEvent, addSheetRows, updateAppContainerStyle } from './commonFuncs';
import { uploadAttachFile, downloadAttachAll, previewFile, downloadFile, deleteFile } from './attachFile';
const openAttachList = ref(false);
const openPreviewFile = ref(false);
const attachListData = ref<any[]>([]);
const summaryByType = ref(false);
const summaryByTypeDisabled = ref<boolean>(true);
const isFilling = ref(true);
const isEditable = ref(true);
const dictDataFields = ref<any>({});
let summarySheetData: any = null;
let summarySheetDataByType: any = null;

// summaryData 设置非必填
const props = withDefaults(
  defineProps<{ content: { ejs: string; dataSource: any; summaryData: any; summaryDataByType: any; fileName: string; dictData: any[]; editable: boolean } }>(),
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

const renderExcelBySjs = function (ejs: string, dataSource: any = {}, summaryData: any = {}, summaryDataByType: any = {}, dictData: any = {}, editable: boolean = true) {
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
        addSheetRows(sheet, dataSource);
        const ds = dataSource[sheet.name()];
        if (!ds.project) {
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

const saveWorkBookData = function () {
  const tableData = getSheetTableData(spread);
  emits('saveWorkBook', tableData);
};

const exportExcel = function () {
  exportToExcel(spread, props);
};

// 导入excel
const importExcel = function () {
  message.warning('开发中... 敬请期待');
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
  // initWorkbook(spread);
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
    registerEvent(spread, emits);
  }, 300);
  // debugger;
  isEditable.value = props.content.editable === undefined ? true : props.content.editable;
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
