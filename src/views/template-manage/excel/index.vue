<template>
  <div class="template-container">
    <DynamicTable
      row-key="id"
      header-title="Excel模板管理"
      title-tooltip="Excel模板的管理"
      :data-request="Api.template.getExcelTemplateList"
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
    <TemplateDrawer ref="templateDrawerRef" @save="saveTemplate" />
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { baseColumns, type TableListItem, type TableColumnItem } from './columns';
  import TemplateDrawer from './template-drawer.vue';
  import { useTable } from '@/components/core/dynamic-table';
  import Api from '@/api/';

  defineOptions({
    name: 'SystemPermissionRole',
  });

  const templateDrawerRef = ref();
  const [DynamicTable, dynamicTableInstance] = useTable();

  const openMenuModal = async (record: Partial<TableListItem>, type) => {
    templateDrawerRef.value.open(record, type);
  };
  const saveTemplate = function (template, sjs) {
    const hideLoading = message.loading({
      content: '模板保存中...',
      duration: 0,
    });
    // 有id即认为是编辑
    if (template.id) {
      Api.template
        .updateExcelTemplate(template, sjs)
        .then(() => {
          message.success('模板编辑成功');
        })
        .catch((err) => {
          message.error('模板编辑失败');
        })
        .finally(() => {
          hideLoading();
        });
    } else {
      Api.template
        .saveExcelTemplate(template, sjs)
        .then(() => {
          message.success('模板保存成功', 1);
        })
        .catch((err) => {
          message.error('模板保存失败', 1);
        })
        .finally(() => {
          hideLoading();
        });
    }
    dynamicTableInstance?.reload();
  };
  const delRowConfirm = async (record: TableListItem) => {
    const hideLoading = message.loading('模板删除中...', 0);
    await Api.template.deleteExcelTemplate(record._id).finally(() => {
      hideLoading();
    });
    dynamicTableInstance?.reload();
  };

  const columns: TableColumnItem[] = [
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
            openMenuModal(record, 'edit');
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
            onConfirm: () => delRowConfirm(record),
          },
        },
      ],
    },
  ];
</script>

<style lang="less" scoped>
  .template-container {
    position: relative;
    height: 100%;
  }
</style>
