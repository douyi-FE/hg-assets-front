<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div class="excel-container">
      <slot name="excelsearch" />
      <div
        id="design_container"
        ref="designRef"
        class="design-container"
        :disabled="!isFullscreen"
      />
      <div id="excel_status" class="excel-status" />
      <a-float-button style="right: 80px; bottom: 80px" @click="toggleFullscreen">
        <template #icon>
          <component :is="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined" />
        </template>
      </a-float-button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue';
  import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';

  const props = withDefaults(
    defineProps<{
      columns: Array<{ displayName: string; name: string; width?: number }>;
      dataSource: Array<any>;
    }>(),
    { columns: () => [], dataSource: () => [] },
  );

  const isFullscreen = ref(false);
  const open = ref(false);
  const currentInstance = getCurrentInstance();
  const designRef = ref();
  let workBook: any = null;
  const sheetProtectionOptions = {
    allowSelectLockedCells: true,
    allowSelectUnlockedCells: true,
    allowFilter: true,
    allowSort: true,
    allowResizeRows: true,
    allowResizeColumns: true,
    allowEditObjects: false,
    allowDragInsertRows: false,
    allowDragInsertColumns: false,
    allowInsertRows: false,
    allowInsertColumns: false,
    allowDeleteRows: false,
    allowDeleteColumns: false,
    allowOutlineColumns: false,
    allowOutlineRows: false,
  };

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
    open.value = false;
    updateAppContainerStyle();
  };

  const initDesigner = () => {
    workBook = new GC.Spread.Sheets.Workbook('design_container');
    var statusBar = new GC.Spread.Sheets.StatusBar.StatusBar(
      document.getElementById('excel_status'),
    );
    statusBar.bind(workBook);
  };

  const renderDataSource = function (dataSource: Array<any> = []) {
    const sheet = workBook.getActiveSheet();
    sheet.suspendPaint();
    // 绑定数据源
    sheet.setDataSource(dataSource);
    // 配置列属性
    sheet.bindColumns(props.columns);
    sheet.resumePaint();
    // 配置列筛选
    sheet.rowFilter(
      new GC.Spread.Sheets.Filter.HideRowFilter(
        new GC.Spread.Sheets.Range(0, 0, dataSource.length, props.columns.length),
      ),
    );
    // 设置表单保护
    sheet.options.protectionOptions = sheetProtectionOptions;
    sheet.options.allowCellOverflow = false;
    sheet.options.isProtected = true;
  };

  watch(
    () => props.dataSource,
    (curDataSource) => {
      renderDataSource(curDataSource);
    },
  );

  onMounted(() => {
    initDesigner();
  });
</script>

<style lang="less" scoped>
  .excel-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .design-container {
      width: 100%;
      height: calc(100% - 20px);
    }

    .excel-status {
      height: 20px;
    }
  }
</style>
