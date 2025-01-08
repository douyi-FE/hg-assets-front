<template>
  <div class="containers">
    <DynamicTable
      row-key="id"
      header-title="流程设计列表"
      title-tooltip="流程设计列表"
      :data-request="Api.flowDesign.getFlowDesignList"
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
          @click="() => flowDrawerRef && flowDrawerRef.openDrawer()"
        >
          新增
        </a-button>
      </template>
    </DynamicTable>
    <flow-drawer ref="flowDrawerRef" :form-state="{ id: '', name: '', note: '' }" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { baseColumns } from './column';
  import FlowDrawer from './flow-drawer.vue';
  import Api from '@/api';
  import { useTable } from '@/components/core/dynamic-table';

  const flowDrawerRef = ref<any>(null);
  const [DynamicTable, dynamicTableInstance] = useTable();
  const columns: any[] = [
    ...baseColumns,
    {
      title: '操作',
      width: 130,
      dataIndex: 'ACTION',
      hideInSearch: true,
      fixed: 'right',
      actions: ({ record }) => [
        {
          label: '编辑',
          auth: {
            perm: 'template:excel:edit',
            effect: 'disable',
          },
          onClick: () => {
            flowDrawerRef.value.openDrawer(record);
          },
        },
        {
          label: '删除',
          auth: {
            perm: 'template:excel:delete',
            effect: 'disable',
          },
          disabled: record.isBuildIn,
          popConfirm: {
            title: '你确定要删除吗？',
            placement: 'left',
            onConfirm: () => {
              Api.flowDesign.deleteFlowDesign({ id: record._id }).then(() => {
                dynamicTableInstance?.reload();
                message.success('删除成功');
              });
            },
          },
        },
      ],
    },
  ];
</script>

<style lang="less" scoped>
  .containers {
    position: relative;
    height: 100%;
  }
</style>
