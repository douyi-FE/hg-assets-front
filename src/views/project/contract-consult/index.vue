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
  import { getApplicationData, updateApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';

  const userStore = useUserStore();
  const templateId = '67cbfd142863e20432278b59';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref({
    ejs: '',
    dataSource: {
      table: [],
    },
    fileName: '导出数据文件.xlsx',
  });

  const fetchExcel = async function () {
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
