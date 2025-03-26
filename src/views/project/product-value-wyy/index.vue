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
  import { getExtractData } from './data-extract';
  import excelBook from '@/components/business/excel-book/index.vue';
  import { getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData, updateApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';
  import { getTemplateDataByApplicationName } from '@/api/backend/api/templateData';

  const userStore = useUserStore();
  // 产值-对外模板id
  let templateId = '67c981e79a8d1883c16036ea';
  // 咨询合同-对外模板id
  let contractTemplateId = '67c83a5dd8038b2ee0b9ad15';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref<any>({
    ejs: '',
    dataSource: {
      table: [],
    },
    fileName: '导出数据文件.xlsx',
  });

  const getTemplateId = async function () {
    return Promise.all([
      getTemplateDataByApplicationName({ applicationName: '产值表-无营业收入' }),
      getTemplateDataByApplicationName({ applicationName: '咨询合同台帐-对外' }),
    ]).then(([template, contractTemplate]) => {
      templateId = template.templateId;
      contractTemplateId = contractTemplate.templateId;
    });
  };
  const getTemplateData = async function () {
    const applicationData = await getApplicationData({ templateId: templateId });
    const contractApplicationData = await getApplicationData({ templateId: contractTemplateId });
    const extractData = getExtractData(
      contractApplicationData.applicationData.table,
      applicationData.applicationData.table,
    );
    return extractData;
  };

  const fetchExcel = async function () {
    getTemplateId()
      .then(() => {
        Promise.all([getApplicationById(templateId), getTemplateData()]).then(
          ([template, templateData]) => {
            content.value = {
              ejs: template.content,
              dataSource: {
                table: templateData,
              },
              fileName: template.name,
            };
          },
        );
      })
      .catch((err) => {
        message.error('获取模板数据失败');
      });
  };

  const saveWorkBook = function (data: any) {
    updateApplicationData({
      templateId: templateId,
      userId: userStore.userInfo.id,
      applicationData: data,
    })
      .then(() => {
        message.success('保存成功');
      })
      .catch(() => {
        message.error('保存失败');
      });
  };

  onMounted(() => {
    fetchExcel();
  });
</script>
