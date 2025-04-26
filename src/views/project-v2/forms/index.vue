<template>
  <a-drawer v-model:open="isOpen" title="项目信息">
    <a-radio-group v-model:value="category" style="margin-bottom: 20px">
      <a-radio value="project">项目</a-radio>
      <a-radio value="device">设备</a-radio>
      <a-radio value="engineer">工程</a-radio>
    </a-radio-group>
    <component
      :ref="(el) => (comRef = el)"
      :is="
        category === 'project'
          ? Project
          : category === 'device'
            ? Device
            : category === 'engineer'
              ? Engineer
              : Project
      "
    />
    <template #extra>
      <a-space>
        <a-button @click="isOpen = false">取消</a-button>
        <a-button type="primary" @click="submitForm">保存</a-button>
      </a-space>
    </template>
  </a-drawer>
</template>

<script setup lang="ts">
  import { inject, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import Project from './project.vue';
  import Device from './device.vue';
  import Engineer from './engineer.vue';
  import { createProject } from '@/api/backend/api/project';

  const isOpen = ref<boolean>(false);
  const category = ref<string>('project');
  const comRef = ref();
  const refreshProjectList = inject<Function>('refreshProjectList');

  const submitForm = function () {
    comRef.value
      .getData()
      .then((state) => {
        return createProject(state);
      })
      .then(() => {
        message.success('添加成功');
        isOpen.value = false;
        refreshProjectList!();
      })
      .catch(() => {
        message.error('添加失败');
      });
  };

  defineExpose({
    openDrawer() {
      isOpen.value = true;
    },
  });
</script>
