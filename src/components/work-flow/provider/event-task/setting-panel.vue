<template>
  <div class="bpmn-vue-container">
    <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
      <a-form-item label="事件通知" name="eventType">
        <a-radio-group v-model:value="form.eventType">
          <a-radio value="1">发送相关人</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="handleClick" :disabled="!elementData">保存</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script lang="ts" setup>
  import { ref, watch, onUnmounted, toRaw } from 'vue';
  import { Button } from 'ant-design-vue';
  import { eventBus } from '@/utils/event-bus';

  const AButton = Button;

  const props = defineProps({
    element: {
      type: String,
      default: null,
      validator(value) {
        try {
          JSON.parse(value as string);
          return true;
        } catch (error) {
          return false;
        }
      },
    },
  });

  const emit = defineEmits(['bpmn-action']);
  const elementData = ref<any>(null);
  const formRef = ref<any>(null);
  const form = ref({
    eventType: '1',
  });
  const rules = {
    eventType: [{ required: true, message: '请选择事件通知' }],
  };

  const handleClick = () => {
    formRef.value?.validate().then((valid) => {
      // 触发更新
      eventBus.emit(`bpmn-action-${elementData.value?.id}`, {
        type: 'update-properties',
        payload: toRaw(form.value),
      });
    });
  };

  // 调试用 - 监听元素变化
  watch(
    () => props.element,
    (newVal) => {
      try {
        elementData.value = JSON.parse(newVal);
        form.value = {
          ...form.value,
          ...elementData.value['extends'],
        };
      } catch (error) {
        elementData.value = null;
        console.error('解析元素数据失败:', error);
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    elementData.value = null;
  });
</script>

<style lang="less" scoped>
  .bpmn-vue-container {
    margin: 12px;
    padding: 12px;
    border-top: 1px solid rgba(5, 5, 5, 0.06);

    /* 深度选择器穿透 Ant Design 样式 */
    :deep(.ant-btn) {
      margin-right: 8px;
    }

    :deep(.ant-alert) {
      margin-top: 8px;
    }
  }
</style>
