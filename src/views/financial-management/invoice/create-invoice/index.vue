<template>
  <div class="create-invioce-wrapper">
    <a-steps :current="current" :items="items" />
    <div class="steps-content">
      <component :is="steps[current].content" ref="curComponentRef" />
    </div>
    <div class="steps-action">
      <a-button v-if="current < steps.length - 1" type="primary" @click="next">下一步</a-button>
      <a-button
        v-if="current == steps.length - 1"
        type="primary"
        @click="message.success('Processing complete!')"
      >
        提交
      </a-button>
      <a-button v-if="current > 0" style="margin-left: 8px" @click="prev">上一步</a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message } from 'ant-design-vue';
  import projectInfo from './project-info.vue';
  import invioceInfo from './invioce-info.vue';
  import invoiceGenerated from './invoice-generated.vue';
  import flowRegister from './flow-register.vue';

  const current = ref<number>(0);
  const curComponentRef = ref();
  const steps = [
    {
      title: '项目信息',
      content: projectInfo,
    },
    {
      title: '已开发票',
      content: invoiceGenerated,
    },
    {
      title: '发票信息',
      content: invioceInfo,
    },
    {
      title: '流程登记',
      content: flowRegister,
    },
  ];
  const items = steps.map((item) => ({ key: item.title, title: item.title }));
  const next = () => {
    curComponentRef.value?.onSubmit().then((res) => {
      current.value++;
    });
  };
  const prev = () => {
    current.value--;
  };
</script>

<style lang="less" scoped>
  .create-invioce-wrapper {
    padding: 20px;
  }

  .steps-content {
    min-width: 600px;
    margin-top: 20px;
    padding: 20px;
  }
</style>
