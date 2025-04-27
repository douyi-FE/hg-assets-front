<template>
  <a-form
    ref="projectFormRef"
    :model="formState"
    :rules="rules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
  >
    <a-form-item name="project_name" label="项目名称">
      <a-input v-model:value="formState.project_name" />
    </a-form-item>
    <a-form-item name="project_code" label="项目编码">
      <a-input v-model:value="formState.project_code" />
    </a-form-item>
    <a-form-item name="contract_name" label="合同名称">
      <a-input v-model:value="formState.contract_name" />
    </a-form-item>
    <a-form-item name="contract_party_a" label="合同甲方">
      <a-input v-model:value="formState.contract_party_a" />
    </a-form-item>
    <a-form-item name="contract_party_b" label="合同乙方">
      <a-input v-model:value="formState.contract_party_b" />
    </a-form-item>
    <a-form-item name="sign_date" label="签订日">
      <a-input v-model:value="formState.sign_date" />
    </a-form-item>
    <a-form-item name="contract_amount" label="合同金额">
      <a-input-number v-model:value="formState.contract_amount" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const projectFormRef = ref();
  const rules = {
    project_name: [{ required: true, message: '请输入项目名称' }],
    project_code: [{ required: true, message: '请输入项目编码' }],
    contract_name: [{ required: true, message: '请输入合同名称' }],
  };
  const formState = ref({
    project_name: '海油工程珠海深水海洋工程装备制造基地二期工程项目后评价',
    project_code: 'PROJ-002',
    contract_name: '海油工程珠海深水海洋工程装备制造基地二期工程项目后评价服务合同',
    contract_party_a: '海洋石油工程（珠海）有限公司',
    contract_party_b: '弘庚咨询有限公司',
    industry: '石油化工',
    sign_date: '2024-02-20',
    contract_amount: 128000,
  });

  defineExpose({
    getData() {
      return projectFormRef.value.validate();
    },
  });
</script>
