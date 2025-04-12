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
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import templateBind from '@/components/business/template-bind/index.vue';
  import { getApplicationById } from '@/api/backend/api/application';
  import { getApplicationData, saveApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';
  import { eventBus } from '@/utils/event-bus';
  const APPLICATION_NAME = '电气仪表-工程量计算书';
  const APPLICATION_ID = '67f9f22c572177c961d2062b';
  let templateId = '';
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref({
    ejs: '',
    dataSource: {
      table: [[]],
    },
    fileName: '导出数据文件.xlsx',
  });
  const deptId = ref<number>(0);
  const dataSource = ref({
    table: [[]],
  });
  const isShowTemplateSetting = ref(false);
  const userStore = useUserStore();
  const getTemplateId = async function () {
    return getApplicationById(APPLICATION_ID);
  };

  const fetchExcel = async function () {
    getTemplateId()
      .then((res) => {
        templateId = res.templateId;
        if (!templateId) {
          message.error('模板ID不存在');
          return;
        }
        Promise.all([
          getApplicationById(templateId),
          getApplicationData({ templateId: templateId, deptId: deptId.value }),
        ])
          .then(([template, applicationData]) => {
            dataSource.value = template.initDataSource;
            content.value = {
              ejs: template.content,
              dataSource: applicationData?.applicationData || dataSource,
              fileName: template.name,
            };
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
      templateId: APPLICATION_ID,
      userId: userStore.userInfo.id,
      deptId: deptId.value,
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
    deptId.value = userStore.userInfo.dept?.id;
    eventBus.on('deptChange', handleDeptChange);
  });

  const handleDeptChange = function (_deptId: number) {
    deptId.value = _deptId;
    fetchExcel();
  };
</script>

<style lang="less" scoped>
  .excel-book-container {
    width: 100%;
    height: 100%;
  }
</style>
