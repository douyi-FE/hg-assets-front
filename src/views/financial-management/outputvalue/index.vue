<template>
  <h1>产指表</h1>
  <a-button type="primary" @click="handleClick">生成报告</a-button>
</template>
<script setup lang="ts">
  import { sampleReportData } from './data';
  import Api from '@/api';
  import { downloadFile } from '@/utils/helper/utils';

  const handleClick = () => {
    Api.outputvalue.createOutputValueReport(sampleReportData).then((res) => {
      const { data, fileName, type } = res;
      downloadFile(data.data, fileName, type);
    });
  };
</script>

<style lang="less" scope>
  .bpmn-container {
    height: 500px;
  }
</style>
