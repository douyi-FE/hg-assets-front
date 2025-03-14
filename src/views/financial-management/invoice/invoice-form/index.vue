<template>
  <a-drawer
    title="开票申请"
    :width="'50%'"
    :open="isOpen"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    @close="onClose"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="labelCol"
      :wrapper-col="wrapperCol"
    >
      <a-divider orientation="left">
        <span style="font-weight: bold">项目信息</span>
      </a-divider>
      <ProjectInfo v-model:form-state="formState" />
      <a-divider orientation="left">
        <span style="font-weight: bold">已开发票</span>
      </a-divider>
      <InvoiceGenerated v-model:form-state="formState" />
      <a-divider orientation="left">
        <span style="font-weight: bold">发票信息</span>
      </a-divider>
      <InvoiceInfo v-model:form-state="formState" />
      <a-divider orientation="left">
        <span style="font-weight: bold">流转登记</span>
      </a-divider>
      <FlowRegister v-model:form-state="formState" />
    </a-form>
    <template #extra>
      <a-space>
        <a-button @click="onClose">取消</a-button>
        <a-button type="primary" @click="() => onSubmit('draft')">保存</a-button>
        <a-button @click="() => onSubmit('pending')">提交</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>
<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import dayjs from 'dayjs';
  import ProjectInfo from './project-info/index.vue';
  import InvoiceInfo from './invoice-info/index.vue';
  import FlowRegister from './flow-register/index.vue';
  import InvoiceGenerated from './invoice-generated/index.vue';
  import { defaultFormState as projectInfoDefaultFormState } from './project-info/default';
  import { invoiceInfoDefault } from './invoice-info/default';
  import { flowRegisterDefault } from './flow-register/default';
  import { rules as projectInfoRules } from './project-info/rules';
  import { useInvoiceStore } from '@/store/modules/invioce';
  import Api from '@/api';

  const props = defineProps<{
    isOpen: boolean;
  }>();

  const invoiceApplicationId = '67cbfd142863e20432278b59';
  const invoiceProductId = '67cbfe242863e20432278b6e';
  const invoiceStore = useInvoiceStore();
  const formRef = ref<any>();
  const rules = ref<any>({
    ...projectInfoRules,
  });
  const formState = ref<any>({
    // 'draft' | 'pending' | 'approved'
    process: 'draft',
    ...projectInfoDefaultFormState,
    ...invoiceInfoDefault,
    ...flowRegisterDefault,
  });
  const labelCol = { span: 8 };
  const wrapperCol = { span: 16 };

  const emit = defineEmits<{
    (e: 'update:isOpen', value: boolean): void;
    (e: 'submit', value: any): void;
  }>();

  const onClose = () => {
    emit('update:isOpen', false);
  };

  // 获取发票应用信息
  const fetchInvoiceApplicationData = () => {
    Api.applicationData
      .getApplicationData({
        templateId: invoiceApplicationId,
      })
      .then((res) => {
        invoiceStore.setInvoiceApplicationData(res.applicationData);
      });
  };

  // 获取合同台账应用信息
  const fetchInvoiceProductData = () => {
    Api.applicationData
      .getApplicationData({
        templateId: invoiceProductId,
      })
      .then((res) => {
        invoiceStore.setInvoiceProductData(res.applicationData);
      });
  };

  const onSubmit = (process: string) => {
    formRef.value.validate().then((res) => {
      emit('submit', { ...res, status: process });
    });
  };

  const setFormState = (data: any) => {
    formState.value = {
      ...formState.value,
      ...data,
    };
  };

  watch(
    () => props.isOpen,
    (newVal) => {
      if (newVal) {
        const code =
          dayjs().format('YYYYMMDD') +
          '-' +
          Array.from({ length: 1 }, () => Math.random().toString(36).split('.')[1]).join('-');
        formState.value = {
          ...formState.value,
          code: formState.value.applyCode || code,
        };
      }
    },
  );

  onMounted(() => {
    fetchInvoiceApplicationData();
    fetchInvoiceProductData();
  });

  defineExpose({
    setFormState,
  });
</script>
