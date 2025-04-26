<template>
  <a-form
    ref="projectFormRef"
    :model="formState"
    :rules="rules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
  >
    <a-form-item name="engineer_name" label="工程名称">
      <a-input v-model:value="formState.engineer_name" />
    </a-form-item>
    <a-form-item name="engineer_code" label="工程编码">
      <a-input v-model:value="formState.engineer_code" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const projectFormRef = ref();
  const rules = {
    engineer_name: [{ required: true, message: '请输入工程名称' }],
    engineer_code: [{ required: true, message: '请输入工程编码' }],
  };
  const formState = ref({
    engineer_name: 'xxx工程',
    engineer_code: 'engineer-001',
  });
</script>
