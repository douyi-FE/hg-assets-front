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
  import { useTable } from '@/components/core/dynamic-table';

  const [DynamicTable, dynamicTableInstance] = useTable();

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
            downloadTemplate(record._id);
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
              deleteWordTemplate(record._id);
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
    Api.template
      .saveWordTemplate(
        {
          name: params.name,
          code: params.code,
          isBuildIn: params.isBuildIn,
          note: params.note,
          status: params.status,
        },
        params.file,
      )
      .then(() => {
        message.success('模板上传成功', 1);
        dynamicTableInstance?.reload();
      });
  };

  const downFile = function (data) {
    const { file: bufferHexString, fileName } = data;
    // 将十六进制字符串转换为 Uint8Array
    const byteArray = new Uint8Array(
      bufferHexString.match(/.{1,2}/g).map((byte) => parseInt(byte, 16)),
    );
    // 创建 Blob 对象
    const blob = new Blob([byteArray], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName; // 设置下载的文件名
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url); // 释放内存
  };
  const downloadTemplate = async function (id: string) {
    const result = await Api.template.downloadWordTemplate({
      id,
    });
    console.log('下载文件：', result);
    downFile(result);
  };

  // 删除模板
  const deleteWordTemplate = async function (id: string) {
    Api.template
      .deleteWordTemplate({
        id,
      })
      .then(() => {
        message.success('删除成功', 1);
        dynamicTableInstance?.reload();
      })
      .catch(() => {
        message.error('删除失败', 1);
      });
  };
</script>
