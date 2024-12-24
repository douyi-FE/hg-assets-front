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
      templateJson?: any;
      sjs?: any;
    }>(),
    { templateJson: () => ({}) },
  );

  const isFullscreen = ref(false);
  const open = ref(false);
  const currentInstance = getCurrentInstance();
  const designRef = ref();
  let designer: any = null;

  const updateAppContainerStyle = () => {
    const appEl: HTMLDivElement =
      currentInstance?.appContext.app._container || document.querySelector('#app');

    appEl.style.setProperty('opacity', isFullscreen.value ? '0' : '1');
    appEl.style.setProperty('visibility', isFullscreen.value ? 'hidden' : 'visible');
    appEl.style.setProperty('position', isFullscreen.value ? 'absolute' : 'relative');
    nextTick(() => {
      const workBook = designer.getWorkbook();
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
    const workBook = designer.getWorkbook();
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
      },
      function (e) {
        console.log('模板加载错误', e); // 错误回调函数
      },
    );
  };

  const initDesigner = () => {
    designer = new GC.Spread.Sheets.Designer.Designer('design_container');
    designer.setConfig(GC.Spread.Sheets.Designer.ToolBarModeConfig);

    if (props.sjs) {
      loadTemplate(props.sjs);
    }
  };

  const getSpreadSJS = function () {
    const workBook = designer.getWorkbook();
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

  defineExpose({
    getSpreadSJS,
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
