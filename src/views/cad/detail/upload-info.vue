<!--
 * @Author: walker
 * @Date: 2025-06-17 10:00:00
 * @LastEditors: walker
 * @LastEditTime: 2025-06-17 10:00:00
 * @Description: 上传实体单元格信息
-->
<template>
  <div class="upload-info">
    <a-button @click="handleUpload">上传</a-button>
    <div id="upload_info_content" style="display: none" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  const emit = defineEmits(['uploadSuccess']);

  let spread: any = null;

  // 根据值获取单元格
  const getAllCellByValue = (value: string) => {
    if (!spread) {
      return [];
    }
    let res: any = null;
    const sheetCount = spread.getSheetCount();

    for (let i = 0; i < sheetCount; i++) {
      const sheet = spread.getSheet(i);
      const rowCount = sheet.getRowCount();
      const colCount = sheet.getColumnCount();

      for (let row = 0; row < rowCount; row++) {
        for (let col = 0; col < colCount; col++) {
          const cellValue = sheet.getValue(row, col);
          if (cellValue === value) {
            res = { sheetName: sheet.name(), row: row, col: col, rowCount };
            break;
          }
        }
      }
    }
    return res;
  };

  const getCellInfo = (cell: any) => {
    if (!cell) {
      return [];
    }
    const res: any[] = [];
    const { sheetName, row, col, rowCount } = cell;
    const sheet = spread.getSheetFromName(sheetName);
    for (let i = row + 1; i < rowCount; i++) {
      const name = sheet.getValue(i, col + 1);
      const startTime = sheet.getValue(i, col + 2);
      const endTime = sheet.getValue(i, col + 3);
      const price = sheet.getValue(i, col + 4);
      if (!name && !startTime && !endTime && !price) {
        continue;
      }
      res.push({
        row: i,
        sheetName,
        attach: {
          name,
          time: [startTime, endTime],
          price,
        },
      });
    }
    return res;
  };

  const getAllCellInfo = function () {
    const assetNameCell = getAllCellByValue('资产名称');
    const assetNameInfo = getCellInfo(assetNameCell);
    return assetNameInfo;
  };

  const handleUpload = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = '.xlsx';
    input.onchange = function (e: any) {
      const file = e.target.files[0];
      const wb = GC.Spread.Sheets.findControl('upload_info_content');
      wb.import(file, () => {
        message.success('导入成功');
        const cellInfo = getAllCellInfo();
        emit('uploadSuccess', cellInfo);
      });
    };
    input.click();
  };

  onMounted(() => {
    spread = new GC.Spread.Sheets.Workbook(document.getElementById('upload_info_content'), {
      sheetCount: 1,
    });
  });
</script>
