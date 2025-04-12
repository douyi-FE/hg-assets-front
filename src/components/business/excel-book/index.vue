<template>
  <div class="work-book-container">
    <Teleport to="body" :disabled="!isFullscreen">
      <div class="work-book-content">
        <div class="work-book-operator">
          <a-button type="primary" @click="exportExcel">导出</a-button>
          <a-button type="primary" @click="saveWorkBookData">保存</a-button>
          <FullscreenOutlined v-if="!isFullscreen" @click="toggleFullscreen" />
          <FullscreenExitOutlined v-else @click="toggleFullscreen" />
        </div>
        <input id="uploadFileInput" type="file" style="display: none" multiple />
        <div id="work_book_container" class="work-book-container" />
      </div>
    </Teleport>
  </div>

  <!-- 附件列表模态框v2 -->
  <a-modal
    v-model:open="openAttachList"
    title="附件列表"
    width="800px"
    :destroyOnClose="true"
    :footer="false"
  >
    <div style="display: flex; gap: 10px; padding-bottom: 10px">
      <a-button type="primary" @click="uploadAttachFile">添加附件</a-button>
      <a-button @click="downloadAttachAll">下载全部</a-button>
    </div>
    <a-table
      :columns="attachListColumns"
      :dataSource="attachListData"
      :pagination="false"
      style="height: calc(100vh - 600px)"
    >
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
          <a-popconfirm
            v-if="isFilling"
            title="确定删除该附件吗？"
            @confirm="deleteFile(record.fileId, index)"
            @cancel="() => {}"
          >
            <a-button type="link">删除</a-button>
          </a-popconfirm>
        </template>
      </template>
    </a-table>
  </a-modal>

  <!-- 文件预览模态框v2 -->
  <a-modal
    v-model:open="openPreviewFile"
    title="文件预览"
    width="60%"
    :destroyOnClose="true"
    :footer="false"
    wrapClassName="viewContainer"
  >
    <div id="viewContainer" style="height: calc(100vh - 600px)" />
  </a-modal>
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
  import { initUploadFile } from '@/components/basic/ejs-design/resource/fileUploadCellType';
  import { eventBus } from '@/utils/event-bus';
  import { attachListColumns } from '@/components/basic/ejs-design/config';
  const openAttachList = ref(false);
  const openPreviewFile = ref(false);
  const attachListData = ref<any[]>([]);
  const isFilling = ref(true);
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

  const props = withDefaults(
    defineProps<{ content: { ejs: string; dataSource: any; fileName: string } }>(),
    {
      content: () => ({
        ejs: '',
        dataSource: {
          table: [],
        },
        fileName: '导出数据文件.xlsx',
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
    // const table = sheet.tables.findByName('table');
    // const tableData: any[] = [];
    // let hasData = false;
    // if (table) {
    //   const dataRange = table.dataRange();
    //   const data = sheet.getArray(
    //     dataRange.row,
    //     dataRange.col,
    //     dataRange.rowCount,
    //     dataRange.colCount,
    //   );
    //   if (data.length > 0) {
    //     for (let i = 0; i < data.length; i++) {
    //       const item = {};
    //       for (let j = 0; j < data[i].length; j++) {
    //         if (data[i][j]) {
    //           hasData = true;
    //         }
    //         item[table.getColumnDataField(j)] = data[i][j];
    //       }
    //       tableData.push(item);
    //     }
    //   }
    // }
    return sheet.getDataSource().getSource();
  }

  const renderExcelBySjs = function (ejs: string, dataSource: any = { table: [] }) {
    return new Promise((resolve, reject) => {
      const arrayBuffer = base64ToArrayBuffer(ejs);
      const fileBlob = new Blob([arrayBuffer], {
        type: 'application/octet-stream',
      });
      spread.open(
        fileBlob,
        function () {
          // clearSelections();
          spread.suspendPaint();
          const sheet = spread.getActiveSheet();
          sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(dataSource));
          spread.resumePaint();
          initUploadFile(spread);
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
      var table = info.sheet.tables.findByName('table');
      const tableRange = table.dataRange();
      const tableCol = info.col - tableRange.col;
      const dataField = table.getColumnDataField(tableCol);
      emits('cellClick', {
        row: info.row,
        col: info.col,
        dataField: dataField,
        rowData: ds['table'][info.row - tableRange.row - 1],
      });
    });
  };

  watch(
    () => props.content,
    (newVal) => {
      renderExcelBySjs(toRaw(newVal.ejs), toRaw(newVal.dataSource));
    },
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
