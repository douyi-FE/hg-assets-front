<template>
  <a-form
    ref="projectFormRef"
    :model="formState"
    :rules="rules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
  >
    <a-form-item name="device_name" label="设备名称">
      <a-input v-model:value="formState.device_name" />
    </a-form-item>
    <a-form-item name="device_code" label="设备编码">
      <a-input v-model:value="formState.device_code" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  const projectFormRef = ref();
  const rules = {
    device_name: [{ required: true, message: '请输入设备名称' }],
    device_code: [{ required: true, message: '请输入设备编码' }],
  };
  const formState = ref({
    device_name: 'xxx设备',
    device_code: 'device-001',
  });
</script>
