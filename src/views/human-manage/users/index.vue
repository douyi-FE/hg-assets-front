<template>
  <div class="excel-book-container">
    <excel-book
      ref="excelBookRef"
      :key="excelBookKey"
      class="excel-book"
      :content="content"
      @saveWorkBook="saveWorkBook"
      @cellClick="cellClick"
    />
    <template-bind
      v-model:isShowTemplateSetting="isShowTemplateSetting"
      @bind-success="fetchExcel"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import templateBind from '@/components/business/template-bind/index.vue';
  import { getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData } from '@/api/backend/api/applicationData';
  import { getTemplateDataByApplicationName } from '@/api/backend/api/templateData';

  const APPLICATION_NAME = '人员信息';
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
  const isShowTemplateSetting = ref(false);
  const getTemplateId = async function () {
    return getTemplateDataByApplicationName({ applicationName: APPLICATION_NAME });
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
        ])
          .then(([template, applicationData]) => {
            content.value = {
              ejs: template.content,
              dataSource: applicationData.applicationData,
              fileName: template.name,
            };
          })
          .catch(() => {
            message.error('获取模板数据失败');
            isShowTemplateSetting.value = true;
          });
      })
      .catch(() => {
        message.error('获取模板数据失败');
      });
  };

  const saveWorkBook = function (base64: string) {
    console.log('base64', base64);
  };

  const cellClick = function (data: any) {
    console.log('data', data);
  };

  onMounted(() => {
    fetchExcel();
  });
</script>

<style lang="less" scoped>
  .excel-book-container {
    width: 100%;
    height: 100%;
  }
</style>
