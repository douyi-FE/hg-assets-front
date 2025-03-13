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
  import { getExtractData } from './data-extract.ts';
  import excelBook from '@/components/business/excel-book/index.vue';
  import { getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData, updateApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';
  const userStore = useUserStore();
  // 产值模板id
  const templateId = '67cbfe242863e20432278b6e';
  // 咨询合同台账id
  const contractTemplateId = '67cbfd142863e20432278b59';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref<any>({
    ejs: '',
    dataSource: {
      table: [],
    },
    fileName: '导出数据文件.xlsx',
  });

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
