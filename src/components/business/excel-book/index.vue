<template>
  <div class="work-book-container">
    <div class="work-book-operator">
      <a-button type="primary" @click="saveWorkBook">保存</a-button>
    </div>
    <div id="work_book_container" class="work-book-container" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, watch } from 'vue';
  import { base64ToArrayBuffer } from '@/components/basic/ejs-design/resource/commonFunctions';

  const props = withDefaults(defineProps<{ ejs: string }>(), {
    ejs: '',
  });
  const emits = defineEmits(['saveWorkBook']);
  let workBook: any = null;

  const renderExcelBySjs = function (ejs: string) {
    return new Promise((resolve, reject) => {
      const arrayBuffer = base64ToArrayBuffer(ejs);
      const fileBlob = new Blob([arrayBuffer], {
        type: 'application/octet-stream',
      });
      // store.setInitDataSource(JSON.parse(data.initDataSource));
      // 也可以写成 "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 等
      workBook.open(
        fileBlob,
        function () {
          // clearSelections();
          workBook.suspendPaint();
          workBook.resumePaint();
          resolve(true);
        },
        function (e) {
          reject(e);
        },
      );
    });
  };

  const saveWorkBook = function () {
    workBook.save((blob) => {
      console.log('blob', blob);
      // 将 blob 转为 Base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = function () {
        const base64data: string = (reader.result as string) || '';
        // base64data 通常带有前缀，如 "data:application/octet-stream;base64,XXXXXXXX"
        // 如果后端只想存储纯粹的 base64，去掉前缀即可：
        const pureBase64 = base64data.split(',')[1];
        emits('saveWorkBook', pureBase64);
      };
    });
  };

  watch(
    () => props.ejs,
    (newVal) => {
      renderExcelBySjs(newVal);
    },
  );

  onMounted(() => {
    workBook = new GC.Spread.Sheets.Workbook('work_book_container');
  });
</script>

<style lang="less" scoped>
  .work-book-container {
    height: 100%;
    display: flex;
    flex-direction: column;

    .work-book-operator {
      padding: 10px;
      text-align: right;
      background-color: #fff;
      margin-bottom: 10px;
    }

    .work-book-container {
      flex-grow: 1;
      border: 1px solid;
    }
  }
</style>
