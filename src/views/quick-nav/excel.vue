<template>
  <excel-book
    ref="excelBookRef"
    class="excel-book"
    :templateId="id as string"
    :content="content"
    :key="excelBookKey"
    @saveWorkBook="saveWorkBook"
  />
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { uniqueId } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import { getApplicationById, updateApplicationById } from '@/api/backend/api/application';
  import { getApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';

  const route = useRoute();
  const userStore = useUserStore();
  const { id = '' } = route.query;
  const excelBookKey = ref('');
  const excelBookRef = ref();
  const content = ref({
    ejs: '',
    dataSource: {
      table: [],
    },
  });

  const getTemplate = function () {
    return getApplicationById(id as string).then((res) => {
      return res.content;
    });
  };

  const fetchApplicationData = function () {
    return getApplicationData({
      templateId: id as string,
      userId: userStore.userInfo.id,
    }).then((res) => {
      return res.applicationData;
    });
  };

  const saveWorkBook = function (base64: string) {
    updateApplicationById({
      id: id as string,
      content: base64,
    }).then(() => {
      message.success('保存成功');
    });
  };

  onMounted(() => {
    excelBookKey.value = uniqueId('ejs_');
    Promise.all([getTemplate(), fetchApplicationData()]).then(([template, applicationData]) => {
      content.value = {
        ejs: template,
        dataSource: applicationData,
      };
    });
  });
</script>
