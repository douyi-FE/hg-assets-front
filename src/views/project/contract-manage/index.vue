<template>
  <div class="excel-book-container">
    <excel-book
      ref="excelBookRef"
      :key="excelBookKey"
      class="excel-book"
      :content="content"
      :dataSource="dataSource"
      @saveWorkBook="saveWorkBook"
      @cellClick="cellClick"
      @saveHistoryVersion="saveHistoryVersion"
      @historyVersionList="showHistoryList"
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
    <History
      :applicationId="content.applicationId"
      v-model:isShowHistoryList="isShowHistoryList"
      @historyVersionApply="handleHistoryVersionApply"
    />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import History from './history.vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import templateBind from '@/components/business/template-bind/index.vue';
  import { getApplicationByName, getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData, saveApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';
  import Api from '@/api';
  const APPLICATION_NAME = '工程咨询服务合同登记表'; // 替换【咨询合同台账】
  let templateId = '';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref<any>({
    applicationId: '',
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
  const isShowHistoryList = ref(false);
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
              applicationId: applicationData._id,
              ejs: template.content,
              dataSource: applicationData?.applicationData || dataSource,
              fileName: template.name,
            };
            return applicationData;
          })
          .catch(() => {
            message.error('获取模板数据失败');
            isShowTemplateSetting.value = true;
          });
      })
      .catch(() => {
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

  /******** 应用历史版本 ********/

  const addApplicationDataHistory = async (data: any) => {
    const response = await Api.templateDataHistory.addApplicationDataHistory(data);
    return response || [];
  };

  const saveHistoryVersion = function (data: any) {
    addApplicationDataHistory({
      ...data,
      userId: userStore.userInfo.id,
      mark: '保存为历史版本',
    })
      .then((res) => {
        message.success('保存为历史版本成功');
      })
      .catch((err) => {
        message.error('保存为历史版本失败');
      });
  };

  const showHistoryList = function (applicationId: string) {
    isShowHistoryList.value = true;
  };

  const handleHistoryVersionApply = function (historyId: string) {
    Api.templateDataHistory.getApplicationDataHistoryById(historyId).then((res) => {
      const { applicationData = null } = res;
      if (applicationData) {
        excelBookRef.value.updateSheetDataSource(applicationData);
      }
    });
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
