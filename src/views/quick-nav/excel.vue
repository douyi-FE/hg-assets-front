<template>
  <excel-book
    ref="excelBookRef"
    class="excel-book"
    :ejs="ejs"
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

  const route = useRoute();
  const { id = '' } = route.query;
  const excelBookKey = ref('');
  const excelBookRef = ref();
  const ejs = ref('');

  const getTemplate = function () {
    getApplicationById(id as string).then((res) => {
      ejs.value = res.content;
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
    getTemplate();
  });
</script>
