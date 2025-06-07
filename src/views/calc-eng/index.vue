<!-- 静设备-工程量计算书 -->
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
  import { useRoute } from 'vue-router';
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import templateBind from '@/components/business/template-bind/index.vue';
  import { getApplicationByName, getApplicationById } from '@/api/backend/api/application';
  import { getTemplateFieldDict } from '@/api/backend/api/applicationData';
  import { getProjectDevice, saveProjectDevice } from '@/api/backend/api/projectDevice';
  import { useUserStore } from '@/store/modules/user';
  // import { eventBus } from '@/utils/event-bus';
  let app = '';
  const TEMPLATE_FIELD_DICT_NAME = '列表字段取值字典';
  let templateId = '';
  let type = '',
    project = '',
    device = '',
    engineerId = '',
    engineer = '',
    isDone = '';
  const editable = ref(true);
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const content = ref({
    ejs: '',
    dataSource: {
      table: [{}],
    },
    summaryData: {
      table: [{}],
    },
    summaryDataByType: {
      table: [{}],
    },
    summarySheetComments: {},
    dictData: [],
    fileName: app + '.xlsx',
    editable: editable,
    hasDict: true,
  });
  // const deptId = ref<number>(0);
  const userStore = useUserStore();
  const dataSource = ref({
    table: [{}],
    userId: userStore.userInfo.id,
    type: '',
    project: '',
    device: '',
    engineerId: '',
    engineer: '',
  });
  const isShowTemplateSetting = ref(false);
  const route = useRoute();
  const getTemplateId = async function () {
    return getApplicationByName(app);
  };

  const templateFieldDictId = (await getApplicationByName(TEMPLATE_FIELD_DICT_NAME)).templateId;

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
          getProjectDevice({
            type,
            project,
            device,
            engineerId,
            engineer,
          }),
          getTemplateFieldDict({ templateId: templateFieldDictId, dictName: app }),
        ])
          .then(([template, projectData, templateFieldDict]) => {
            let initDataSource = null;
            const userName = userStore.userInfo.username;
            try {
              initDataSource = JSON.parse(template.initDataSource);
            } catch (error) {
              initDataSource = template.initDataSource;
            }
            dataSource.value = initDataSource!;
            dataSource.value.type = type;
            dataSource.value.project = project;
            dataSource.value.device = device;
            dataSource.value.engineerId = engineerId;
            dataSource.value.engineer = engineer;
            console.log(projectData?.projectDevice?.summarySheetComments);
            content.value = {
              ejs: template.content,
              dataSource: projectData?.projectDevice?.projectData[userName] || dataSource,
              summaryData: projectData?.projectDeviceSummary || dataSource,
              summaryDataByType: projectData?.projectDeviceSummaryByType || dataSource,
              summarySheetComments: projectData?.projectDevice?.summarySheetComments || {},
              fileName: template.name,
              dictData: templateFieldDict || [],
              editable: editable,
              hasDict: true,
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
    const userName = userStore.userInfo.username;
    const summaryComments = data['summarySheetComments'];
    delete data['summarySheetComments'];
    saveProjectDevice({
      type,
      project,
      device,
      engineer,
      engineerId,
      templateId,
      projectData: {
        [userName]: data || dataSource.value,
      },
      summarySheetComments: summaryComments,
    })
      .then((res) => {
        message.success('保存数据成功');
        fetchExcel();
      })
      .catch((err) => {
        message.error('保存数据失败');
      });
  };

  const cellClick = function (data: any) {
    console.log('data', data);
  };

  onMounted(() => {
    // 从URL参数获取项目编号、装置编号以及工程编号
    type = route.query.type as string;
    project = route.query.project as string;
    device = route.query.device as string;
    engineerId = route.query.engineerId as string;
    engineer = route.query.engineer as string;
    isDone = route.query.isDone as string;
    app = route.query.app as string;
    // 如果isDone为true，则不可编辑
    editable.value = isDone === 'false';
    fetchExcel();
  });
</script>

<style lang="less" scoped>
  .excel-book-container {
    width: 100%;
    height: 100%;
  }
</style>
