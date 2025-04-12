<template>
  <div v-if="isShowTemplateSetting">
    <a-modal v-model:open="isOpenTemplateSetting" title="请选择模板" @ok="setTemplate">
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
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { message } from 'ant-design-vue';
  import { getExcelTemplateByIds, getExcelTemplateList } from '@/api/backend/api/template';
  import { publishApplication } from '@/api/backend/api/application';
  import { saveApplicationData } from '@/api/backend/api/applicationData';
  import { useUserStore } from '@/store/modules/user';

  defineProps({
    isShowTemplateSetting: {
      type: Boolean,
      default: false,
    },
  });

  const emit = defineEmits(['update:modelValue', 'bind-success']);

  const userStore = useUserStore();
  const isOpenTemplateSetting = ref(false);
  const applicationNameRef = ref();
  const formState = ref({
    templateId: '',
  });
  const templateList = ref<any[]>([]);

  const setTemplate = async function () {
    applicationNameRef.value.validate().then(async () => {
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
          initDataSource,
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
          emit('update:modelValue', false);
          emit('bind-success');
        })
        .catch(() => {
          message.error('绑定失败');
        });
    });
  };

  const fetchTemplate = async function () {
    getExcelTemplateList({}).then((res) => {
      templateList.value = res;
    });
  };

  onMounted(() => {
    fetchTemplate();
  });
</script>
