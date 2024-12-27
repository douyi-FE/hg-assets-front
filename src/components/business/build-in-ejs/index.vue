<template>
  <div class="built-in-container">
    <div class="built-in-operator">
      <a-button type="primary" :icon="h(SaveOutlined)" @click="saveBuiltEjs">保存</a-button>
    </div>
    <div id="built-in_design_container" class="built-in-design-container" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, h } from 'vue';
  import { SaveOutlined } from '@ant-design/icons-vue';
  import { message } from 'ant-design-vue';
  import Api from '@/api';
  import { getBuiltInEjs, saveBuiltInEjs } from '@/api/basis/built-in';

  const props = withDefaults(defineProps<{ name: string; templateName: string }>(), {
    name: '',
    templateName: '',
  });
  let workBook: any = null;

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
        },
        function (e) {
          // 错误回调函数
          reject(e.message);
        },
      );
    });
  };

  const fetchExcelTemplate = async function () {
    const list = await Api.template.getExcelTemplateList({
      name: props.templateName,
    });
    if (Array.isArray(list) && list.length > 0) {
      const sjsHex = list[0].file;
      return loadTemplate(sjsHex);
    }
  };

  const saveBuiltEjs = async function () {
    const sjs: any = await getSpreadSJS();
    saveBuiltInEjs({ name: props.name }, sjs).then(() => {
      message.success('保存成功');
    });
  };

  const renderExcelBySjs = async function () {
    const builtInList = await getBuiltInEjs({ name: props.name });
    if (Array.isArray(builtInList) && builtInList.length > 0) {
      const sjs: any = builtInList[0]?.sjs || '';
      if (sjs) {
        loadTemplate(sjs);
      }
    } else {
      await fetchExcelTemplate();
    }
  };

  const getSpreadSJS = function () {
    return new Promise((resolve, reject) => {
      // 将spread保存为sjs文件。
      workBook.save(
        function (blob) {
          resolve(blob);
        },
        function (err) {
          reject(err);
        },
      );
    });
  };

  const initDesigner = () => {
    workBook = new GC.Spread.Sheets.Workbook('built-in_design_container');
  };

  onMounted(async () => {
    initDesigner();
    renderExcelBySjs();
  });
</script>

<style lang="less" scoped>
  .built-in-container {
    display: flex;
    flex-direction: column;
    height: 100%;

    .built-in-operator {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
      padding: 10px 20px;
      border-radius: 5px;
      background-color: #fff;
    }

    .built-in-design-container {
      flex-grow: 1;
      padding: 5px;
      background-color: #fff;
    }
  }
</style>
