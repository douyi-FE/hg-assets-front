<template>
  <div class="cad-container">
    <DynamicTable
      row-key="id"
      header-title="项目图纸管理"
      title-tooltip="项目图纸的管理"
      :data-request="Api.cad.getCadList"
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
          @click="isShowCadDrawer = true"
        >
          新增
        </a-button>
      </template>
    </DynamicTable>
    <a-drawer
      title="新增项目图纸"
      placement="right"
      :closable="false"
      :open="isShowCadDrawer"
      :get-container="false"
      :style="{ position: 'absolute' }"
      width="100%"
      @close="isShowCadDrawer = false"
    >
      <template #extra>
        <div class="cad-drawer-header">
          <a-input v-model:value="projectName" placeholder="请输入项目名称" />
          <a-button style="margin-right: 8px" @click="isShowCadDrawer = false">取消</a-button>
          <a-button type="primary" @click="saveCad">保存</a-button>
        </div>
      </template>
      <cad-detail
        ref="cadDetailRef"
        v-model:mx-file-url="mxFileUrl"
        :detial-id="detialId"
        :is-show-excel-file="isShowCadDrawer"
      />
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { baseColumns, type TableColumnItem } from './columns';
  import cadDetail from './detail/index.vue';
  import { useTable } from '@/components/core/dynamic-table';
  import Api from '@/api/';
  import { createCad, deleteCad } from '@/api/backend/api/cad';

  const isShowCadDrawer = ref(false);
  const projectName = ref('');
  const [DynamicTable, dynamicTableInstance] = useTable();
  const defaultMxFileUrl = `${import.meta.env.VITE_BASE_SERVSER_HOST}/cad/changfang.mxweb`;
  const mxFileUrl = ref<string>('');
  const cadDetailRef = ref<any>(null);
  const detialId = ref<string>('');

  const saveCad = async () => {
    if (projectName.value === '') {
      message.error('请输入项目名称');
      return;
    }
    const data = await cadDetailRef.value.getData();
    console.log('data', {
      ...data,
      projectName: projectName.value,
    });
    createCad({
      ...data,
      projectName: projectName.value,
    }).then((res) => {
      console.log('res', res);
      message.success('新增成功');
      isShowCadDrawer.value = false;
      dynamicTableInstance.reload();
    });
  };

  const columns: TableColumnItem[] = [
    ...baseColumns,
    {
      title: '操作',
      width: 220,
      dataIndex: 'ACTION',
      hideInSearch: true,
      fixed: 'right',
      actions: ({ record }) => [
        {
          label: '编辑',
          // disabled: record.status === 2,
          onClick: () => {
            console.log('编辑', record);
          },
        },
        {
          label: '查看',
          onClick: () => {
            detialId.value = record._id;
            isShowCadDrawer.value = true;
          },
        },
        {
          label: '删除',
          popConfirm: {
            title: '你确定要删除吗？',
            placement: 'left',
            onConfirm: () => {
              deleteCad(record._id).then((res) => {
                console.log('res', res);
                message.success('删除成功');
                dynamicTableInstance.reload();
              });
            },
          },
        },
      ],
    },
  ];
</script>

<style scoped lang="less">
  .cad-container {
    width: 100%;
    height: calc(100% - 48px);
    position: relative;
    .cad-drawer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }
  }
</style>
