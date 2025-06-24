<template>
  <div id="export_excel_content" class="export-excel__content" />
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  let spread: any = null;

  const basicColumns = ['资产名称', '开始时间', '结束时间', '价格'];

  const exportExcel = function (data: any, cellTitle: string) {
    if (!spread) return;

    const sheet = spread.getSheet(0);
    const list = [
      basicColumns,
      ...data.map((item: any) => [item.name, item.startTime, item.endTime, item.price]),
    ];
    for (let i = 0; i < list.length; i++) {
      const row = list[i];
      for (let j = 0; j < row.length; j++) {
        sheet.setValue(i, j, row[j]);
      }
    }
    spread.export(
      function (blob) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${cellTitle}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      function (e) {
        console.log(e);
      },
      {
        fileType: GC.Spread.Sheets.FileType.excel,
      },
    );
  };

  onMounted(() => {
    spread = new GC.Spread.Sheets.Workbook(document.getElementById('export_excel_content'), {
      sheetCount: 1,
    });
  });

  defineExpose({
    exportExcel,
  });
</script>

<style scoped>
  .export-excel__content {
    display: none;
  }
</style>
