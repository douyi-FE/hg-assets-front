<template>
  <div class="work-book-container">
    <div class="work-book-operator">
      <a-button type="primary" @click="saveWorkBook">保存</a-button>
      <a-button style="margin-left: 10px" @click="fetchExcelTableDataSource">刷新</a-button>
    </div>
    <div id="work_book_container" class="work-book-container" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import Api from '@/api';

  const props = withDefaults(defineProps<{ templateName: string; templateCode: string }>(), {
    templateName: '',
    templateCode: '',
  });
  let workBook: any = null;

  const saveWorkBook = function () {
    const sheet = workBook.getActiveSheet();
    const table = sheet.tables.findByName('table');
    // const dirtyRows = table.getDirtyRows();
    const slicerData = table.getSlicerData();
    const columns = slicerData.columnNames;
    const data = slicerData.data;
    const newTableData = data.map((item) => {
      let dataItem = {};
      columns.forEach((col, index) => {
        dataItem[col] = item[index].value;
      });
      return dataItem;
    });
    console.log('newTableData:', newTableData);
    Api.templateData
      .saveTemplateData({
        name: props.templateName,
        code: props.templateCode,
        record: {
          table: newTableData,
        },
      })
      .then(() => {
        message.success('保存成功', 1);
      })
      .catch((err) => {
        message.error('保存失败');
      });
  };

  const setSheetRange = function () {
    const sheet = workBook.getActiveSheet();
    const table = sheet.tables.findByName('table');
    if (table !== null) {
      const { col, colCount, row, rowCount } = table.dataRange();
      sheet.setRowCount(row + rowCount);
      sheet.setColumnCount(col + colCount);
    }
  };

  const loadDataSource = function (data: { table: Array<any> } = { table: [] }) {
    if (!(Array.isArray(data.table) && data.table.length > 0)) {
      return;
    }
    const sheet = workBook.getActiveSheet();
    const json = { table: data.table };
    const dataSource = new GC.Spread.Sheets.Bindings.CellBindingSource(json);
    sheet.setDataSource(dataSource);
  };

  const loadTemplate = function (sjsHex: string) {
    return new Promise((resolve, reject) => {
      workBook.suspendPaint();
      // hex转换为buffer
      const uint8Array = new Uint8Array(sjsHex.length / 2);
      for (let i = 0; i < sjsHex.length; i += 2) {
        uint8Array[i / 2] = parseInt(sjsHex.substr(i, 2), 16);
      }
      // 将 Buffer 转换为 Blob
      const blob = new Blob([uint8Array]);
      // 创建一个 File 对象
      const file = new File([blob], 'template.sjs');
      // 打开sjs文件到spread。
      workBook.open(
        file,
        function () {
          // 成功回调函数
          resolve({});
          fetchExcelTableDataSource();
          setSheetRange();
          workBook.resumePaint();
        },
        function (e) {
          // 错误回调函数
          reject(e.message);
        },
      );
    });
  };

  const renderExcelBySjs = async function () {
    const list = await Api.template.getExcelTemplateList({
      name: props.templateName,
    });
    if (Array.isArray(list) && list.length > 0) {
      const sjsHex = list[0].file;
      return loadTemplate(sjsHex);
    }
  };

  const fetchExcelTableDataSource = async function () {
    message.loading('数据加载中...', 0);
    const tableDataSource: any = await Api.templateData
      .getTemplateDataList({
        code: props.templateCode,
      })
      .then((list) => {
        return list[0];
      })
      .finally(() => {
        message.destroy();
      });
    loadDataSource(tableDataSource.record);
  };

  onMounted(() => {
    workBook = new GC.Spread.Sheets.Workbook('work_book_container');
    renderExcelBySjs();
  });
</script>

<style lang="less" scoped>
  .work-book-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .work-book-operator {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
      padding: 10px 20px;
      border-radius: 5px;
      background-color: #fff;
    }

    .work-book-design-container {
      flex-grow: 1;
      padding: 5px;
      background-color: #fff;
    }
  }
</style>
