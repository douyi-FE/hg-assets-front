<!-- 电气仪表-工程量计算书 -->
<template>
  <div class="excel-book-container">
    <excel-book ref="excelBookRef" :key="excelBookKey" class="excel-book" :content="content" :dataSource="dataSource"
      @saveWorkBook="saveWorkBook" @cellClick="cellClick" />
    <template-bind v-model:isShowTemplateSetting="isShowTemplateSetting" @bind-success="
      () => {
        fetchExcel();
        isShowTemplateSetting = false;
      }
    " />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import excelBook from '@/components/business/excel-book/index.vue';
import templateBind from '@/components/business/template-bind/index.vue';
import { getApplicationByName, getApplicationById } from '@/api/backend/api/application';
import { getTemplateFieldDict } from '@/api/backend/api/applicationData';
import { getProjectDevice, saveProjectDevice } from '@/api/backend/api/projectDevice';
import { useUserStore } from '@/store/modules/user';
import { useRoute } from 'vue-router';
// import { eventBus } from '@/utils/event-bus';
const APPLICATION_NAME = '电气仪表-工程量计算书';
const TEMPLATE_FIELD_DICT_NAME = '列表字段取值字典';
let templateId = '';
let type = '', project = '', device = '', engineer = '', isDone = '';
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
  dictData: [],
  fileName: APPLICATION_NAME + '.xlsx',
  editable: editable,
});
// const deptId = ref<number>(0);
const userStore = useUserStore();
const dataSource = ref({
  table: [{}],
  userId: userStore.userInfo.id,
  type: '',
  project: '',
  device: '',
  engineer: '',
});
const isShowTemplateSetting = ref(false);
const route = useRoute();
const getTemplateId = async function () {
  return getApplicationByName(APPLICATION_NAME);
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
        getProjectDevice({ userId: userStore.userInfo.id, type, project, device, engineer }),
        getTemplateFieldDict({ templateId: templateFieldDictId, dictName: APPLICATION_NAME }),
      ])
        .then(([template, projectData, templateFieldDict]) => {
          let initDataSource = null;
          try {
            initDataSource = JSON.parse(template.initDataSource);
          } catch (error) {
            initDataSource = template.initDataSource;
          }
          dataSource.value = initDataSource;
          dataSource.value.userId = userStore.userInfo.id;
          dataSource.value.type = type;
          dataSource.value.project = project;
          dataSource.value.device = device;
          dataSource.value.engineer = engineer;
          content.value = {
            ejs: template.content,
            dataSource: projectData?.projectDeviceWithUserId?.projectData || dataSource,
            summaryData: projectData?.projectDeviceSummary?.projectData || dataSource,
            summaryDataByType: projectData?.projectDeviceSummaryByType?.projectData || dataSource,
            fileName: template.name,
            dictData: templateFieldDict || [],
            editable: editable,
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
  saveProjectDevice({
    userId: userStore.userInfo.id,
    type,
    project,
    device,
    engineer,
    templateId,
    projectData: data || dataSource.value,
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
  engineer = route.query.engineer as string;
  isDone = route.query.isDone as string;
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
