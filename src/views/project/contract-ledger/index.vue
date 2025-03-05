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
  import excelBook from '@/components/business/excel-book/index.vue';
  import { getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData } from '@/api/backend/api/applicationData';

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
      getApplicationById('67c83a5dd8038b2ee0b9ad15'),
      getApplicationData({ templateId: '67c83a5dd8038b2ee0b9ad15' }),
    ]).then(([template, applicationData]) => {
      content.value = {
        ejs: template.content,
        dataSource: applicationData.applicationData,
        fileName: template.name,
      };
    });
  };

  const saveWorkBook = function (base64: string) {
    console.log('base64', base64);
  };

  onMounted(() => {
    fetchExcel();
  });
</script>
