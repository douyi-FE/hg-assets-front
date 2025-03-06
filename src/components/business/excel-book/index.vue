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
        <div id="work_book_container" class="work-book-container" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
  import { getCurrentInstance, nextTick, onMounted, ref, toRaw, watch } from 'vue';
  import { FullscreenOutlined, FullscreenExitOutlined } from '@ant-design/icons-vue';
  import { base64ToArrayBuffer } from '@/components/basic/ejs-design/resource/commonFunctions';

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
  const emits = defineEmits(['saveWorkBook']);
  let workBook: any = null;
  const isFullscreen = ref(false);
  const currentInstance = getCurrentInstance();

  const updateAppContainerStyle = () => {
    const appEl: HTMLDivElement =
      currentInstance?.appContext.app._container || document.querySelector('#app');

    appEl.style.setProperty('opacity', isFullscreen.value ? '0' : '1');
    appEl.style.setProperty('visibility', isFullscreen.value ? 'hidden' : 'visible');
    appEl.style.setProperty('position', isFullscreen.value ? 'absolute' : 'relative');
    nextTick(() => {
      workBook.addSheet(1, new GC.Spread.Sheets.Worksheet('custom'));
      workBook.removeSheet(1);
    });
  };

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
    updateAppContainerStyle();
  };

  function getSheetTableData(workBook: any) {
    const sheet = workBook.getActiveSheet();
    const table = sheet.tables.findByName('table');
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
          const item = {};
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
    return tableData;
  }

  const renderExcelBySjs = function (ejs: string, dataSource: any = { table: [] }) {
    return new Promise((resolve, reject) => {
      const arrayBuffer = base64ToArrayBuffer(ejs);
      const fileBlob = new Blob([arrayBuffer], {
        type: 'application/octet-stream',
      });
      workBook.open(
        fileBlob,
        function () {
          // clearSelections();
          workBook.suspendPaint();
          const sheet = workBook.getActiveSheet();
          sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(dataSource));
          workBook.resumePaint();
          resolve(true);
        },
        function (e) {
          reject(e);
        },
      );
    });
  };

  const saveWorkBookEjs = function () {
    workBook.save((blob) => {
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
    const tableData = getSheetTableData(workBook);
    emits('saveWorkBook', {
      table: tableData,
    });
  };

  const exportExcel = function () {
    workBook.export((blob) => {
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

  watch(
    () => props.content,
    (newVal) => {
      renderExcelBySjs(toRaw(newVal.ejs), toRaw(newVal.dataSource));
    },
  );

  onMounted(() => {
    workBook = new GC.Spread.Sheets.Workbook('work_book_container');
  });
</script>

<style lang="less" scoped>
  .work-book-container {
    height: 100%;
  }
  .work-book-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;

    .work-book-operator {
      padding: 10px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 10px;
      background-color: #fff;
      margin-bottom: 10px;
    }

    .work-book-container {
      flex-grow: 1;
      border: 1px solid;
    }
  }
</style>
