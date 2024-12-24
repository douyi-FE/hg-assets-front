<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div class="code-container">
      <div ref="btnGroupRef" class="operator-btn-group">
        <a-select
          v-model:value="curCode"
          style="width: 200px"
          placeholder="请选择编码模板"
          @change="codeChangeHandler"
        >
          <a-select-option value="project">项目编码</a-select-option>
          <a-select-option value="device">装置工程编码</a-select-option>
          <a-select-option value="professional">专业编码</a-select-option>
        </a-select>
        <!-- <a-button type="primary">加载数据</a-button> -->
      </div>
      <div
        id="design_container"
        ref="designRef"
        class="design-container"
        :disabled="!isFullscreen"
      />
      <a-float-button style="right: 80px; bottom: 80px" @click="toggleFullscreen">
        <template #icon>
          <component :is="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined" />
        </template>
      </a-float-button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { getCurrentInstance, nextTick, onMounted, ref } from 'vue';
  import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import columnSetting from './columns';
  import { getCodeProjectList } from '@/api/code';

  const isFullscreen = ref(false);
  const open = ref(false);
  const currentInstance = getCurrentInstance();
  const btnGroupRef = ref();
  const curCode = ref('project');
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
    btnGroupRef.value.style.display = isFullscreen.value ? 'none' : 'flex';
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
  };

  const renderDataSource = function (dataSource: Array<any> = []) {
    console.log('workBook', workBook);
    const sheet = workBook.getActiveSheet();
    sheet.suspendPaint();
    // 绑定数据源
    sheet.setDataSource(dataSource);
    // 配置列属性
    sheet.bindColumns(columnSetting[curCode.value]);
    sheet.resumePaint();
    // 配置列筛选
    sheet.rowFilter(
      new GC.Spread.Sheets.Filter.HideRowFilter(
        new GC.Spread.Sheets.Range(0, 0, dataSource.length, 6),
      ),
    );
    // 设置表单保护
    sheet.options.protectionOptions = sheetProtectionOptions;
    sheet.options.allowCellOverflow = false;
    sheet.options.isProtected = true;
  };

  const fetchCodeProjectList = function () {
    message.loading('数据加载中', 0);
    getCodeProjectList({ project: curCode.value })
      .then((res) => {
        renderDataSource(res);
      })
      .finally(() => {
        message.destroy();
      });
  };

  const codeChangeHandler = function (val) {
    fetchCodeProjectList();
  };

  onMounted(() => {
    initDesigner();
    fetchCodeProjectList();
  });
</script>

<style lang="less" scoped>
  .code-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .operator-btn-group {
      display: flex;
      margin-bottom: 10px;
      padding: 20px;
      column-gap: 20px;
      border-radius: 5px;
      background-color: #fff;
    }

    .design-container {
      width: 100%;
      height: 100%;
    }
  }
</style>
