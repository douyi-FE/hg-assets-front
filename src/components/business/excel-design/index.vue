<template>
  <Teleport to="body" :disabled="!isFullscreen">
    <div class="excel-bus-container">
      <slot name="excelsearch" />
      <div
        id="excel_design_container"
        ref="designRef"
        class="design-bus-container"
        :disabled="!isFullscreen"
      />
      <a-float-button style="right: 80px; bottom: 80px" @click="toggleFullscreen">
        <template #icon>
          <component :is="isFullscreen ? FullscreenExitOutlined : FullscreenOutlined" />
        </template>
      </a-float-button>
      <ExcelRibbon :designer="designer" @send-initial-data="onSendInitialData" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
  import { getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
  import { FullscreenExitOutlined, FullscreenOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import ExcelRibbon from './ribbons.vue';

  const props = withDefaults(
    defineProps<{
      templateJson?: any;
      sjs?: any;
    }>(),
    { templateJson: () => ({}) },
  );
  const emits = defineEmits(['sendInitialData']);

  const isFullscreen = ref(false);
  const open = ref(false);
  const currentInstance = getCurrentInstance();
  const designRef = ref();
  let designer: any = ref(null);

  const updateAppContainerStyle = () => {
    const appEl: HTMLDivElement =
      currentInstance?.appContext.app._container || document.querySelector('#app');
    appEl.style.setProperty('opacity', isFullscreen.value ? '0' : '1');
    appEl.style.setProperty('visibility', isFullscreen.value ? 'hidden' : 'visible');
    appEl.style.setProperty('position', isFullscreen.value ? 'absolute' : 'relative');
    nextTick(() => {
      const workBook = designer.value.getWorkbook();
      workBook.addSheet(1, new GC.Spread.Sheets.Worksheet('custom'));
      workBook.removeSheet(1);
    });
  };

  const toggleFullscreen = () => {
    isFullscreen.value = !isFullscreen.value;
    open.value = false;
    updateAppContainerStyle();
  };

  const loadTemplate = function (sjsHex: string) {
    message.loading('模板渲染中...', 0);
    const workBook = designer.value.getWorkbook();
    workBook.suspendPaint();
    // hex转换为buffer
    const uint8Array = new Uint8Array(sjsHex.length / 2);
    for (let i = 0; i < sjsHex.length; i += 2) {
      uint8Array[i / 2] = parseInt(sjsHex.substr(i, 2), 16);
    }
    // 将 Buffer 转换为 Blob
    const blob = new Blob([uint8Array]);
    // 创建一个 File 对象
    const file = new File([blob], 'template.sjs');
    // 打开sjs文件到spread。
    workBook.open(
      file,
      function () {
        // 成功回调函数
        workBook.resumePaint();
        message.destroy();
      },
      function (e) {
        message.error('模板渲染发生错误', 1);
        console.log('模板加载错误', e); // 错误回调函数
      },
    );
  };

  const onSendInitialData = function (data) {
    emits('sendInitialData', data);
  };

  const getSpreadSJS = function () {
    const workBook = designer.value.getWorkbook();
    return new Promise((resolve, reject) => {
      // 将spread保存为sjs文件。
      workBook.save(
        function (blob) {
          resolve(blob);
        },
        function (err) {
          reject(err);
        },
      );
    });
  };

  const initDesigner = () => {
    designer.value = new GC.Spread.Sheets.Designer.Designer('excel_design_container');
    designer.value.setConfig(GC.Spread.Sheets.Designer.ToolBarModeConfig);
    if (props.sjs) {
      loadTemplate(props.sjs);
    }
  };

  watch(
    () => props.sjs,
    (curSjs) => {
      if (curSjs) {
        loadTemplate(curSjs);
      }
    },
  );

  onMounted(() => {
    initDesigner();
  });

  onBeforeUnmount(() => {
    designer.value = null;
  });

  defineExpose({
    getSpreadSJS,
  });
</script>

<style lang="less" scoped>
  .excel-bus-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .design-bus-container {
      width: 100%;
      height: calc(100% - 20px);
    }

    .excel-bus-status {
      height: 20px;
    }
  }
</style>
