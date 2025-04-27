<template>
  <a-form
    ref="engineerFormRef"
    :model="formState"
    :rules="rules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }"
  >
    <!-- 隐藏id -->
    <a-form-item name="id" hidden>
      <a-input v-model:value="formState.id" />
    </a-form-item>
    <a-form-item name="name" label="工程名称">
      <a-input v-model:value="formState.name" placeholder="请输入工程名称" />
    </a-form-item>
    <a-form-item name="code" label="工程编码">
      <a-input v-model:value="formState.code" placeholder="请输入工程编码" />
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref, defineProps, defineExpose, watch, toRaw } from 'vue';
  import { cloneDeep } from 'lodash-es';

  const engineerFormRef = ref();
  const rules = {
    name: [{ required: true, message: '请输入工程名称' }],
    code: [{ required: true, message: '请输入工程编码' }],
  };
  const formState = ref({
    id: undefined,
    name: '',
    code: '',
  });

  const props = withDefaults(defineProps<{ engineer: any }>(), {
    engineer: () => ({
      id: undefined,
      name: '',
      code: '',
    }),
  });

  watch(
    () => props.engineer,
    (newVal) => {
      formState.value = cloneDeep(toRaw(newVal));
    },
    {
      immediate: true,
    },
  );
  defineExpose({
    getData() {
      return engineerFormRef.value.validate();
    },
  });
</script>
