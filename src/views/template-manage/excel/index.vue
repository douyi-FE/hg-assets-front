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
  import { useUserStore } from '@/store/modules/user';

  defineOptions({
    name: 'SystemPermissionRole',
  });

  const templateDrawerRef = ref();
  const [DynamicTable, dynamicTableInstance] = useTable();
  const userStore = useUserStore();
  const openMenuModal = async (record: Partial<TableListItem>, type) => {
    if (type === 'add') {
      templateDrawerRef.value.open(record, undefined, type);
    } else {
      Api.template
        .getExcelTemplateEjs(record._id!)
        .then((res) => {
          templateDrawerRef.value.open(record, res.file, type);
        })
        .catch((err) => {
          console.log('模板内容获取发生错误：', err);
          message.error('模板内容获取发生错误', 1);
        });
    }
  };
  const saveTemplate = function (template, sjs, selectedVersion) {
    const hideLoading = message.loading({
      content: '模板保存中...',
      duration: 0,
    });
    // 有id即认为是编辑
    (template.id
      ? Api.template.updateExcelTemplate({ ...template, sjs })
      : Api.template.saveExcelTemplate({ ...template, status: 0, sjs })
    )
      .then((res) => {
        template.id
          ? Api.templateVersion.updateExcelTemplateVersion(
              selectedVersion.id,
              selectedVersion.status,
            )
          : Api.templateVersion.saveExcelTemplateVersion({
              templateId: res.id,
              note: template.note,
              type: 'excel',
              sjs,
            });
        return template;
      })
      .then(() => {
        message.success('模板编辑成功');
        templateDrawerRef.value.close();
      })
      .catch((err) => {
        message.error('模板编辑失败');
      })
      .finally(() => {
        hideLoading();
      });
    dynamicTableInstance?.reload();
  };
  const delRowConfirm = async (record: TableListItem) => {
    const hideLoading = message.loading('模板删除中...', 0);
    await Api.template.deleteExcelTemplate(record._id).finally(() => {
      hideLoading();
    });
    dynamicTableInstance?.reload();
  };
  const publishTemplate = async (record: TableListItem) => {
    await Api.template
      .publishExcelTemplate(record._id)
      .then(() => {
        return Promise.all([
          // 发布模板
          Api.application.publishApplication({
            templateId: record._id,
            isBuildIn: record.isBuildIn,
            name: record.name,
            icon: 'default',
            content: record.file,
            description: record.note,
            initDataSource: (record as any).initDataSource,
          }),
          Api.applicationData.saveApplicationData({
            templateId: record._id,
            userId: userStore.userInfo.id,
            applicationData: (record as any).initDataSource,
          }),
        ]);
      })
      .then(() => {
        message.success('发布成功');
        dynamicTableInstance?.reload();
      })
      .catch(() => {
        message.error('发布失败');
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
            openMenuModal(record, 'edit');
          },
        },
        {
          label: '发布',
          disabled: record.status === 2,
          popConfirm: {
            title: '你确定要发布吗？',
            placement: 'left',
            onConfirm: () => publishTemplate(record),
          },
        },
        {
          label: '删除',
          disabled: record.status === 2,
          popConfirm: {
            title: '你确定要删除吗？',
            placement: 'left',
            onConfirm: () => {
              delRowConfirm(record);
            },
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
