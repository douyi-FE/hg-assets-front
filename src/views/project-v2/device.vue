<template>
  <a-table
    :columns="deviceColumns"
    :data-source="dataSource"
    :pagination="false"
    size="small"
    @expand="
      (expanded, record) => {
        fetchEngineerData(record.code);
      }
    "
  >
    <template #bodyCell="{ column, record }">
      <template v-if="column.dataIndex === 'operation'">
        <a-popconfirm
          title="确认删除此数据吗?"
          ok-text="是"
          cancel-text="否"
          @confirm="deleteDevice(record)"
        >
          <a-button type="link">删除</a-button>
        </a-popconfirm>
      </template>
    </template>
    <template #expandedRowRender>
      <slot name="expandTable" :dataSource="tableSource" />
    </template>
  </a-table>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { deviceColumns } from './columns';

  withDefaults(defineProps<{ dataSource: any[] }>(), { dataSource: () => [] });

  const tableSource = ref<any[]>([]);
  // 获取工程数据
  const fetchEngineerData = function (code) {
    tableSource.value = [
      {
        name: '某某工程' + code,
        code: '67yuj-sdgd2-56vbg' + code,
      },
      {
        name: '某某工程2' + code,
        code: '67yuj-sdgd2-56vbg2' + code,
      },
    ];
  };
  // 删除设备数据
  const deleteDevice = function (device: any) {
    console.log('delete device:', device);
  };
</script>

<style lang="less" scoped>
  .table-header-wrapper {
    display: flex;
    justify-content: flex-end;
  }
</style>
