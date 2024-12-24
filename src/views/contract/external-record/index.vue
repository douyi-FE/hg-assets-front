<template>
  <div class="external-container">
    <ExcelDesign :template-json="templateJson" />
  </div>
</template>

<script setup lang="ts">
  import templateJson from './contract-extenal.json';
  import ExcelDesign from '@/components/basic/excel-design/index.vue';
</script>

<style lang="less" scoped>
  .external-container {
    height: 100%;
  }
</style>
