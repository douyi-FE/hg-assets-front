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
  import { ref } from 'vue';
  import excelBook from '@/components/business/excel-book/index.vue';

  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref({
    ejs: '',
    dataSource: {
      table: [],
    },
  });

  const saveWorkBook = function (base64: string) {
    console.log('base64', base64);
  };
</script>
