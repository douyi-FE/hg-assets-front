<template>
  <div>
    <DynamicTable
      row-key="id"
      header-title="休假管理"
      title-tooltip="休假管理"
      :data-request="
        async (params) => {
          return getLeaveList(params).then((res) => {
            return res.filter((item) => item.flowExecute);
          });
        }
      "
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
  import { useTable } from '@/components/core/dynamic-table';
  import { eventBus } from '@/utils/event-bus';
  import { getFlowBindList } from '@/api/backend/api/flowBind';
  import { createLeave, rejectLeave, updateLeave, getLeaveList } from '@/api/backend/api/leave';
  import {
    createFlowExecute,
    rejectFlowExecute,
    approveFlowExecute,
  } from '@/api/backend/api/flowExecute';
  import { useUserStore } from '@/store/modules/user';

  const [DynamicTable, dynamicTableInstance] = useTable();
  const columns = baseColumns;
  const visible = ref(false);
  const isShowFlowBind = ref(false);
  const bindFlowId = ref('');
  const leaveFormRef = ref();
  const userInfo = useUserStore();
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
  eventBus.on('reject-flow-execute', (record: any) => {
    Promise.all([
      rejectLeave({
        id: record._id,
      }),
      rejectFlowExecute({
        businessId: record._id,
        initiatorId: userInfo.userInfo.id,
      }),
    ])
      .then((res) => {
        message.success('驳回成功');
        dynamicTableInstance.reload();
      })
      .catch((err) => {
        message.error('驳回失败');
      });
  });
  eventBus.on('approve-flow-execute', (record: any) => {
    console.log('record', record);
    approveFlowExecute({
      businessId: record._id,
      initiatorId: userInfo.userInfo.id,
    }).then((res) => {
      message.success('审批成功');
      if (res.status === 'completed') {
        updateLeave({
          id: record._id,
          approverStatus: 'approved',
        }).then((res) => {
          dynamicTableInstance.reload();
        });
      }
    });
  });
  const bindSuccess = () => {
    message.success('绑定成功');
    isShowFlowBind.value = false;
  };
  const saveLeave = () => {
    leaveFormRef.value
      .getFormData()
      .then((res) => {
        return createLeave({
          ...res,
          flowId: bindFlowId.value,
        });
      })
      .then((res) => {
        return createFlowExecute({
          flowId: bindFlowId.value,
          initiatorId: userInfo.userInfo.id,
          businessId: res._id,
          data: {
            description: '请假申请',
          },
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
        message.warn('请先绑定流程');
      } else {
        isShowFlowBind.value = false;
        bindFlowId.value = res[0].flowId;
      }
    });
  });
</script>

<style scoped lang="less"></style>
