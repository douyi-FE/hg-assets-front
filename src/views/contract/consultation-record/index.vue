/** * 咨询台账 */
<template>
  <div class="consulation-container">
    <workbook :columns="columns" :data-source="dataSource" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import message from 'ant-design-vue/es/message';
  import columns from './columns';
  import workbook from '@/components/basic/work-book/index.vue';
  import { getConsultationList } from '@/api/contract/consultation';

  const dataSource = ref<Array<any>>([]);

  const fetchConsultationList = function () {
    message.loading('数据加载中', 0);
    getConsultationList({})
      .then((res) => {
        dataSource.value = res;
      })
      .finally(() => {
        message.destroy();
      });
  };

  onMounted(() => {
    fetchConsultationList();
  });
</script>

<style lang="less" scoped>
  .consulation-container {
    height: 100%;
  }
</style>
