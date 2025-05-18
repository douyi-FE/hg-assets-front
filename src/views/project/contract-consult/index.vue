<template>
  <excel-book ref="excelBookRef" class="excel-book" :content="content" :key="excelBookKey"
    @saveWorkBook="saveWorkBook" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { message } from 'ant-design-vue';
import excelBook from '@/components/business/excel-book/index.vue';
import { getApplicationById } from '@/api/backend/api/application';
import { getApplicationData, updateApplicationData } from '@/api/backend/api/applicationData';
import { useUserStore } from '@/store/modules/user';
import { getTemplateDataByApplicationName } from '@/api/backend/api/templateData';

const userStore = useUserStore();
let templateId = '';
const excelBookRef = ref();
const excelBookKey = ref('');
const content = ref({
  ejs: '',
  dataSource: {
    table: [],
  },
  fileName: '导出数据文件.xlsx',
});

const fetchExcel = async function () {
  getTemplateDataByApplicationName({ applicationName: '工程咨询服务合同登记表' }) // 替换【咨询合同台账】
    .then((res) => {
      console.log('res', res);
      templateId = res.templateId;
      if (!templateId) {
        message.error('模板ID不存在');
        return;
      }
      Promise.all([
        getApplicationById(templateId),
        getApplicationData({ templateId: templateId }),
      ]).then(([template, applicationData]) => {
        content.value = {
          ejs: template.content,
          dataSource: applicationData.applicationData,
          fileName: template.name,
        };
      });
    })
    .catch((err) => {
      message.error('获取模板数据失败');
    });
};

const saveWorkBook = function (data: any) {
  if (!templateId) {
    message.error('模板ID不存在');
    return;
  }
  updateApplicationData({
    templateId: templateId,
    userId: userStore.userInfo.id,
    applicationData: data,
  })
    .then(() => {
      message.success('保存成功');
    })
    .catch(() => {
      message.error('保存失败');
    });
};

onMounted(() => {
  fetchExcel();
});
</script>
