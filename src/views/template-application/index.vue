<template>
  <div class="template-application">
    <DynamicTable
      row-key="id"
      header-title="模板-应用数据"
      title-tooltip="模板-应用数据"
      :data-request="Api.templateData.getTemplateDataList"
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
        <a-button type="primary" :disabled="!$auth('system:role:create')" @click="openMenuModal()">
          新增
        </a-button>
      </template>
    </DynamicTable>
    <a-modal v-model:open="open" title="模板-应用数据" @ok="handleSubmit">
      <a-form
        ref="formRef"
        :model="form"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 14 }"
      >
        <!-- 隐藏项 为编辑行的id -->
        <a-form-item name="id" hidden>
          <a-input v-model:value="form.id" />
        </a-form-item>
        <a-form-item label="应用名称" name="applicationName">
          <a-input v-model:value="form.applicationName" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item label="模板名称" name="templateId">
          <a-select v-model:value="form.templateId" placeholder="请选择模板名称">
            <a-select-option v-for="item in templateList" :key="item._id" :value="item._id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { baseColumns } from './column';
  import Api from '@/api';
  import { useTable } from '@/components/core/dynamic-table';
  import {
    createTemplateData,
    updateTemplateData,
    deleteTemplateData,
  } from '@/api/backend/api/templateData';

  const open = ref(false);
  const formRef = ref();
  const applicationList = ref<any[]>([]);
  const templateList = ref<any[]>([]);
  const form = ref({
    id: '',
    applicationName: '',
    templateId: '',
  });

  const rules = ref({
    applicationName: [{ required: true, message: '请输入应用名称' }],
    templateId: [{ required: true, message: '请选择模板名称' }],
  });
  const [DynamicTable, dynamicTableInstance] = useTable();

  const columns: any[] = [
    ...baseColumns,
    {
      title: '操作',
      dataIndex: 'ACTION',
      width: 220,
      fixed: 'right',
      actions: ({ record }) => [
        {
          label: '编辑',
          disabled: false,
          onClick: () => openMenuModal(record),
        },
        {
          label: '删除',
          disabled: false,
          popConfirm: {
            title: '你确定要删除吗？',
            placement: 'left',
            onConfirm: () => delRowConfirm(record),
          },
        },
      ],
    },
  ];

  const openMenuModal = (record: any = { id: '', applicationId: '', templateId: '' }) => {
    open.value = true;
    form.value = record;
  };

  const delRowConfirm = (record: any) => {
    deleteTemplateData({ id: record._id }).then((res) => {
      dynamicTableInstance?.reload();
      message.success('删除成功');
    });
  };

  const getApplicationList = async () => {
    const res = await Api.application.getApplicationList({});
    applicationList.value = res;
  };

  const getTemplateList = async () => {
    const res = await Api.template.getExcelTemplateList({});
    templateList.value = res;
  };

  const handleSubmit = () => {
    formRef.value.validate().then(() => {
      const selectedTemplate = templateList.value.find(
        (item) => item._id === form.value.templateId,
      );

      const submitData = {
        ...form.value,
        templateName: selectedTemplate?.name,
      };
      // 这里可以调用API提交数据
      const { id, templateId, applicationName, templateName } = submitData;
      const api = id
        ? updateTemplateData({ id, templateId, applicationName, templateName })
        : createTemplateData({ templateId, applicationName, templateName });
      api.then((res) => {
        dynamicTableInstance?.reload();
        message.success('更新成功');
        open.value = false;
      });
    });
  };

  onMounted(() => {
    getApplicationList();
    getTemplateList();
  });
</script>
