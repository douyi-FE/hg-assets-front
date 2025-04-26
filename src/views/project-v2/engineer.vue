<template>
  <a-table :columns="engineerColumns" :data-source="dataSource" :pagination="false">
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'operation'">
        <a-button type="link">查看设备</a-button>
        <a-popconfirm
          title="确认删除此数据吗?"
          ok-text="是"
          cancel-text="否"
          @confirm="deleteEngineer(record)"
        >
          <a-button type="link">删除</a-button>
        </a-popconfirm>
      </template>
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { engineerColumns } from './columns';

  withDefaults(defineProps<{ dataSource: any[] }>(), { dataSource: () => [] });

  const deleteEngineer = function (engineer: any) {
    console.log('delete engineer:', engineer);
  };
</script>

<style lang="less" scoped>
  .table-header-wrapper {
    display: flex;
    justify-content: flex-end;
  }
</style>
