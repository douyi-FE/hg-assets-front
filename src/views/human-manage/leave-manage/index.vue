<template>
  <div>
    <DynamicTable
      row-key="id"
      header-title="休假管理"
      title-tooltip="休假管理"
      :data-request="Api.leave.getLeaveList"
      :columns="columns"
      bordered
      size="small"
    >
      <template #bodyCell="{ column, index }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
      </template>
      <template #toolbar>
        <a-button
          type="primary"
          :disabled="!$auth('system:role:create')"
          @click="openMenuModal({}, 'add')"
        >
          新增
        </a-button>
      </template>
    </DynamicTable>
    <a-drawer title="请假申请" :width="500" :visible="visible" @close="closeDrawer">
      <LeaveForm ref="leaveFormRef" @createSuccess="createSuccess" />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { baseColumns } from './column';
  import LeaveForm from './leave-form.vue';
  import Api from '@/api';
  import { useTable } from '@/components/core/dynamic-table';
  import { eventBus } from '@/utils/event-bus';

  const [DynamicTable, dynamicTableInstance] = useTable();
  const columns = baseColumns;
  const visible = ref(false);
  const leaveFormRef = ref();
  const openMenuModal = (record: any, type: string) => {
    console.log(record, type);
    visible.value = true;
  };
  const closeDrawer = () => {
    visible.value = false;
  };

  eventBus.on('leave-reload', () => {
    dynamicTableInstance.reload();
  });
  const createSuccess = () => {
    visible.value = false;
    dynamicTableInstance.reload();
  };
</script>

<style scoped lang="less"></style>
