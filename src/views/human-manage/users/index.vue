<template>
  <excel-book
    ref="excelBookRef"
    class="excel-book"
    :content="content"
    :key="excelBookKey"
    @saveWorkBook="saveWorkBook"
  />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import { getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData } from '@/api/backend/api/applicationData';
  import { getTemplateDataByApplicationName } from '@/api/backend/api/templateData';

  let templateId = '';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref({
    ejs: '',
    dataSource: {
      table: [],
    },
    fileName: '导出数据文件.xlsx',
  });

  const getTemplateId = async function () {
    return getTemplateDataByApplicationName({ applicationName: '人员信息' });
  };

  const fetchExcel = async function () {
    getTemplateId()
      .then((res) => {
        templateId = res.templateId;
        if (!templateId) {
          message.error('模板ID不存在');
          return;
        }
        Promise.all([
          getApplicationById(templateId),
          getApplicationData({ templateId: templateId }),
        ]).then(([template, applicationData]) => {
          content.value = {
            ejs: template.content,
            dataSource: applicationData.applicationData,
            fileName: template.name,
          };
        });
      })
      .catch(() => {
        message.error('获取模板数据失败');
      });
  };

  const saveWorkBook = function (base64: string) {
    console.log('base64', base64);
  };

  onMounted(() => {
    fetchExcel();
  });
</script>
