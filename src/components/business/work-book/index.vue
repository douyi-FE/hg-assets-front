<template>
  <div class="work-book-container">
    <div class="work-book-operator">
      <a-button type="primary" :icon="h(SaveOutlined)" @click="saveWorkBook">保存</a-button>
    </div>
    <div id="work_book_container" class="work-book-container" />
  </div>
</template>

<script setup lang="ts">
  import { h, onMounted } from 'vue';
  import { SaveOutlined } from '@ant-design/icons-vue';
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
    const tableDataSource: any = await Api.templateData
      .getTemplateDataList({
        code: props.templateCode,
      })
      .then((list) => {
        return list[0];
      });
    console.log('tableDataSource:', tableDataSource.record);
    loadDataSource(tableDataSource.record);
  };

  // const renderExcelBySjs = async function () {
  //   const builtInList = await getBuiltInEjs({ name: props.templateName });
  //   if (Array.isArray(builtInList) && builtInList.length > 0) {
  //     const sjs: any = builtInList[0]?.sjs || '';
  //     if (sjs) {
  //       loadTemplate(sjs);
  //     }
  //   } else {
  //     await fetchExcelTemplate();
  //   }
  // };

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
