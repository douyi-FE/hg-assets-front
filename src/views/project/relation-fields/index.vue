<template>
  <div class="excel-book-container">
    <excel-book
      ref="excelBookRef"
      :key="excelBookKey"
      class="excel-book"
      :templateId="templateId"
      :content="content"
      :dataSource="dataSource"
      @saveWorkBook="saveWorkBook"
      @cellClick="cellClick"
    />
    <template-bind
      v-model:isShowTemplateSetting="isShowTemplateSetting"
      @bind-success="
        () => {
          fetchExcel();
          isShowTemplateSetting = false;
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { nanoid } from 'nanoid';
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import templateBind from '@/components/business/template-bind/index.vue';
  import { getApplicationByName, getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData, saveApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';
  const APPLICATION_NAME = '多列字段取值字典';
  let templateId = '';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref<any>({
    tableName: '',
    tableKey: '',
    ejs: '',
    dataSource: {
      table: [[]],
    },
    fileName: '导出数据文件.xlsx',
  });
  // const deptId = ref<number>(0);
  const dataSource = ref({
    table: [[]],
  });
  const isShowTemplateSetting = ref(false);
  const userStore = useUserStore();
  message.config({
    maxCount: 1,
  });

  const getTemplateId = async function () {
    return getApplicationByName(APPLICATION_NAME);
  };

  const fetchExcel = async function () {
    message.loading('加载中...');
    getTemplateId()
      .then((res) => {
        templateId = res.templateId;
        if (!templateId) {
          message.error('模板ID不存在');
          return;
        }
        Promise.all([
          getApplicationById(templateId),
          getApplicationData({ templateId: templateId }),
        ])
          .then(([template, applicationData]) => {
            dataSource.value = template.initDataSource;
            content.value = {
              tableName: 'application_data',
              tableKey: applicationData?._id || nanoid(),
              ejs: template.content,
              dataSource: applicationData?.applicationData || dataSource,
              fileName: template.name,
            };
            return applicationData || {};
          })
          .catch((err) => {
            message.error('获取模板数据失败');
            isShowTemplateSetting.value = true;
          });
      })
      .catch((err) => {
        console.log('err2', err);
        message.error('获取模板数据失败');
      });
  };

  const saveWorkBook = function (data: any) {
    saveApplicationData({
      templateId: templateId,
      userId: userStore.userInfo.id,
      // deptId: deptId.value,
      applicationData: data || dataSource.value,
    })
      .then((res) => {
        message.success('保存数据成功');
      })
      .catch((err) => {
        message.error('保存数据失败');
      });
  };

  const cellClick = function (data: any) {
    console.log('data', data);
  };

  onMounted(() => {
    fetchExcel();
  });
</script>

<style lang="less" scoped>
  .excel-book-container {
    width: 100%;
    height: 100%;
  }
</style>
