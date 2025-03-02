<template>
  <input id="selectedFile" type="file" name="files[]" accept=".xlsx" style="display: none" />
  <div id="ejs_design" class="ejs-design" ref="ejsDesign" />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { initDesigner } from './resource/initDesigner';
  import { store } from './store';
  import { getSpreadSJS, openTemplateByBase64 } from './resource/commonFunctions';

  const ejsDesign = ref();

  const initSpread = () => {
    const designer = initDesigner('ejs_design');
    store.setDesigner(designer);
    store.setSpread((designer as any).getWorkbook());
  };
  // 组件挂载时
  onMounted(async () => {
    initSpread();
  });

  defineExpose({
    setSJS: (base64: string, fileName: string, initDataSource: any = {}) => {
      openTemplateByBase64(base64, fileName).then(() => {
        if (Object.keys(initDataSource).length > 0) {
          (store.spread as any)
            .getActiveSheet()
            .setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(initDataSource));
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
    height: 100%;
    width: 100%;
  }
</style>
