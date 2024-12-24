<template>
  <div class="template-container">
    <DynamicTable
      row-key="id"
      header-title="Word模板管理"
      title-tooltip="Word模板的管理"
      :data-request="Api.template.getWordTemplateList"
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
        <a-button type="primary" @click="openUploadDialog"> 新增 </a-button>
      </template>
    </DynamicTable>
    <UploadDialog ref="uploadDialogRef" :is-show="isShowUpload" @save-upload="saveUploadTemplate" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { baseColumns, type TableColumnItem } from './columns';
  import UploadDialog from './upload.vue';
  import Api from '@/api/';

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
          label: '下载',
          auth: {
            perm: 'template:excel:edit',
            effect: 'disable',
          },
          onClick: () => {
            downloadTemplate(record.name);
          },
        },
        {
          label: '删除',
          auth: {
            perm: 'template:excel:delete',
            effect: 'disable',
          },
          popConfirm: {
            title: '你确定要删除吗？',
            placement: 'left',
            onConfirm: () => {
              deleteWordTemplate(record.name);
            },
          },
        },
      ],
    },
  ];
  const isShowUpload = ref(false);
  const uploadDialogRef = ref();

  const openUploadDialog = function () {
    uploadDialogRef.value.openUpload();
  };
  const saveUploadTemplate = function (params) {
    console.log('表单数据：', params);
    Api.template.saveWordTemplate(
      {
        name: params.name,
      },
      params.file,
    );
  };

  const downFile = function (data) {
    const base64Data = data.file; // 获取 Base64 字符串
    // 解码 Base64 字符串
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Uint8Array(byteCharacters.length);
    // 将字符转换为字节
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    // 创建 Blob 对象
    const blob = new Blob([byteNumbers], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'downloaded-file.txt'); // 指定下载文件名
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const downloadTemplate = async function (name: string) {
    const result = await Api.template.downloadWordTemplate({
      name,
    });
    console.log('下载文件：', result);
    downFile(result);
  };

  // 删除模板
  const deleteWordTemplate = async function (name: string) {
    Api.template
      .deleteWordTemplate({
        name,
      })
      .then(() => {
        message.success('删除成功', 1);
      })
      .catch(() => {
        message.error('删除失败', 1);
      });
  };
</script>
