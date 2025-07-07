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
import { getApplicationData, saveApplicationData } from '@/api/backend/api/applicationData';
import { useUserStore } from '@/store/modules/user';
import { useRoute } from 'vue-router';
const deptId = ref<number>(0);
const APPLICATION_NAME = '列表字段取值字典';
let templateId = '';
let type = '', project = '', device = '', engineer = '';
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
  dictData: [],
  fileName: APPLICATION_NAME + '.xlsx',
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
        getApplicationData({ templateId: templateId }),
      ])
        .then(([template, dictData]) => {
          let bindingData = template.initDataSource;
          if (dictData && dictData.applicationData) {
            bindingData = dictData.applicationData;
          }
          content.value = {
            ejs: template.content,
            dataSource: bindingData,
            fileName: template.name,
            dictData: dictData,
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
    templateId: templateId,
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
  // 从URL参数获取项目编号、装置编号以及工程编号
  type = route.query.type as string;
  project = route.query.project as string;
  device = route.query.device as string;
  engineer = route.query.engineer as string;
  fetchExcel();
});

</script>

<style lang="less" scoped>
.excel-book-container {
  width: 100%;
  height: 100%;
}
</style>
