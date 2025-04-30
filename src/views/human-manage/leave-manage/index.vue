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
      <template #extra>
        <a-button type="primary" @click="saveLeave">提交</a-button>
      </template>
      <LeaveForm ref="leaveFormRef" />
    </a-drawer>
    <FlowBind
      module="leave"
      :is-show-flow-bind-setting="isShowFlowBind"
      @bind-success="bindSuccess"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { baseColumns } from './column';
  import LeaveForm from './leave-form.vue';
  import FlowBind from '@/components/business/flow-bind/index.vue';
  import Api from '@/api';
  import { useTable } from '@/components/core/dynamic-table';
  import { eventBus } from '@/utils/event-bus';
  import { getFlowBindList } from '@/api/backend/api/flowBind';
  import { createLeave } from '@/api/backend/api/leave';

  const [DynamicTable, dynamicTableInstance] = useTable();
  const columns = baseColumns;
  const visible = ref(false);
  const isShowFlowBind = ref(false);
  const bindFlowId = ref('');
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
  const bindSuccess = () => {
    message.success('绑定成功');
    isShowFlowBind.value = false;
  };
  const saveLeave = () => {
    leaveFormRef.value
      .getFormData()
      .then((res) => {
        console.log('res', res);
        return createLeave({
          ...res,
          flowId: bindFlowId.value,
        });
      })
      .then((res) => {
        message.success('提交成功');
        visible.value = false;
        dynamicTableInstance.reload();
      });
  };

  onMounted(() => {
    getFlowBindList({ module: 'leave' }).then((res) => {
      console.log('flowBindList', res);
      if (res.length === 0) {
        isShowFlowBind.value = true;
      } else {
        isShowFlowBind.value = false;
        bindFlowId.value = res[0].flowId;
      }
    });
  });
</script>

<style scoped lang="less"></style>
