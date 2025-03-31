<template>
  <div class="excel-book-container">
    <excel-book
      ref="excelBookRef"
      :key="excelBookKey"
      class="excel-book"
      :content="content"
      @saveWorkBook="saveWorkBook"
      @cellClick="cellClick"
    />
    <div v-if="isShowTemplateSetting">
      <a-modal v-model:open="isOpenTemplateSetting" title="请选择模板" @ok="setTemplate">
        <!-- <a-form
          :model="formState"
          ref="applicationNameRef"
          :wrapper-col="{ span: 20 }"
          :label-col="{ span: 4 }"
          :rules="{
            applicationName: [{ required: true, message: '请选择模板名称', trigger: 'change' }],
          }"
        >
          <a-form-item label="模板名称" name="applicationName">
            <a-select v-model:value="formState.applicationName" placeholder="请选择模板名称">
              <a-select-option v-for="item in templateList" :key="item.id" :value="item.id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form> -->

        <a-form
          ref="applicationNameRef"
          :model="formState"
          :rules="{
            templateId: [{ required: true, message: '请选择模板', trigger: 'change' }],
          }"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 19 }"
        >
          <a-form-item label="模板名称" name="templateId">
            <a-select v-model:value="formState.templateId" placeholder="请选择模板">
              <a-select-option v-for="item in templateList" :key="item._id" :value="item._id">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-modal>
      <a-float-button
        type="primary"
        shape="square"
        description="设置模板"
        @click="isOpenTemplateSetting = true"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import excelBook from '@/components/business/excel-book/index.vue';
  import { getApplicationById, publishApplication } from '@/api/backend/api/application';
  import { getApplicationData, saveApplicationData } from '@/api/backend/api/applicationData';
  import { getTemplateDataByApplicationName } from '@/api/backend/api/templateData';
  import { getExcelTemplateList, getExcelTemplateByIds } from '@/api/backend/api/template';
  import { useUserStore } from '@/store/modules/user';

  const APPLICATION_NAME = '人员信息';
  let templateId = '';
  const userStore = useUserStore();
  const templateList = ref<any[]>([]);
  const isShowTemplateSetting = ref(false);
  const isOpenTemplateSetting = ref(false);
  const excelBookRef = ref();
  const excelBookKey = ref('');
  const applicationNameRef = ref();
  const content = ref({
    ejs: '',
    dataSource: {
      table: [],
    },
    fileName: '导出数据文件.xlsx',
  });
  const formState = ref({
    templateId: '',
  });

  const setTemplate = async function () {
    applicationNameRef.value.validate().then(async () => {
      console.log('formState', formState.value);
      bindTemplate(formState.value.templateId);
    });
  };

  const bindTemplate = async (id: string) => {
    getExcelTemplateByIds([id]).then((res) => {
      const { initDataSource, file } = res[0];
      return Promise.all([
        publishApplication({
          templateId: id,
          isBuildIn: true,
          name: '人员信息',
          icon: 'default',
          content: file,
          description: '',
        }),
        saveApplicationData({
          templateId: id,
          userId: userStore.userInfo.id,
          applicationData: initDataSource,
        }),
      ])
        .then(() => {
          message.success('绑定成功');
          isOpenTemplateSetting.value = false;
          fetchExcel();
        })
        .catch(() => {
          message.error('绑定失败');
        });
    });
  };

  const getTemplateId = async function () {
    return getTemplateDataByApplicationName({ applicationName: APPLICATION_NAME });
  };

  const fetchTemplate = async function () {
    getExcelTemplateList({}).then((res) => {
      console.log('res', res);
      templateList.value = res;
    });
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
          .then(([template, applicationData]) => {
            content.value = {
              ejs: template.content,
              dataSource: applicationData.applicationData,
              fileName: template.name,
            };
          })
          .catch(() => {
            isShowTemplateSetting.value = true;
          });
      })
      .catch(() => {
        message.error('获取模板数据失败');
      });
  };

  const saveWorkBook = function (base64: string) {
    console.log('base64', base64);
  };

  const cellClick = function (data: any) {
    console.log('data', data);
  };

  onMounted(() => {
    fetchTemplate();
    fetchExcel();
  });
</script>

<style lang="less" scoped>
  .excel-book-container {
    width: 100%;
    height: 100%;
  }
</style>
