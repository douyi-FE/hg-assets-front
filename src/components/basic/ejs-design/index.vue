<template>
  <input id="selectedFile" type="file" name="files[]" accept=".xlsx" style="display: none" />
  <input id="uploadFileInput" type="file" style="display: none" multiple />
  <div id="ejs_design" ref="ejsDesign" class="ejs-design" />

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
          <a-popconfirm v-if="Boolean(store.isFilling)" title="确定删除该附件吗？" @confirm="deleteFile(record.fileId, index)"
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
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import { initDesigner } from './resource/initDesigner';
import { store } from './store';
import { getSpreadSJS, openTemplateByBase64, base64ToBlob } from './resource/commonFunctions';
import { initUploadFile } from './resource/fileUploadCellType';
import { attachListColumns } from './config';
import { eventBus } from '@/utils/event-bus';
import Api from '@/api';
import { initWorkbook } from './resource/initWorkbook';
const ejsDesign = ref();
const openAttachList = ref(false);
const openPreviewFile = ref(false);
const attachListData = ref<any[]>([]);

const initSpread = () => {
  const designer = initDesigner('ejs_design');
  store.setDesigner(designer);
  store.setSpread((designer as any).getWorkbook());
  initWorkbook(store.spread);
};

/********附件列表模态框v2-begin *********/
const uploadAttachFile = () => {
  eventBus.emit('addAttach');
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

// 组件挂载时
onMounted(async () => {
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
  initSpread();
  initUploadFile(store.spread);
});

onUnmounted(() => {
  eventBus.off('openAttachList');
  eventBus.off('setAttachListData');
  eventBus.off('downloadAll');
  eventBus.off('addAttach');
});

defineExpose({
  setSJS: (base64: string, fileName: string, initDataSource: any = {}) => {
    openTemplateByBase64(base64, fileName).then(() => {
      if (Object.keys(initDataSource).length > 0) {
        const spread = (store.spread as any);
        const sheetCount = spread.getSheetCount();
        for (let i = 0; i < sheetCount; i++) {
          const sheet = spread.getSheet(i);
          if (initDataSource[sheet.name()]) {
            sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(initDataSource[sheet.name()]));
            sheet.recalcAll(true);
          }
        }
      }
    });
  },
  getSpreadSJS: () => {
    return getSpreadSJS();
  },
});
</script>

<style lang="less" scoped>
.ejs-design {
  width: 100%;
  height: 100%;
}

.dialog {
  width: calc(100vw - 200px);
  max-width: 1200px;
}

.viewContainer {
  height: calc(100vh - 200px);
  margin: 0 auto;
  overflow: auto;
  text-align: center;
}
</style>
