<template>
  <div id="designer-container" class="amount-container" />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { getPreivewConfig, loadTemplate } from '@/utils/spread/utils';

  let taskId = ref();

  const initDesigner = () => {
    // 初始化designer
    const designer = new GC.Spread.Sheets.Designer.Designer('designer-container');
    designer.setConfig(getPreivewConfig());
    loadTemplate(designer, taskId);
  };

  onMounted(() => {
    initDesigner();
  });
</script>

<style lang="less" scoped>
  .amount-container {
    height: 100%;
  }
</style>
