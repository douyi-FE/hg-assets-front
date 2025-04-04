<template>
  <div class="bpmn-vue-container">
    <a-form ref="formRef" :model="form" layout="vertical" :rules="rules">
      <a-form-item label="审批类型" name="approvalType">
        <a-select v-model:value="form.approvalType" placeholder="请选择审批类型">
          <a-select-option value="1">普通审批</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="审批人" required>
        <a-space direction="vertical" style="width: 100%">
          <a-space-compact block>
            <a-form-item name="approverRole" no-style>
              <a-select
                v-model:value="form.approverRole"
                placeholder="请选择审批角色"
                mode="multiple"
              >
                <a-select-option value="1">直属领导</a-select-option>
                <a-select-option value="2">部门领导</a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item name="approverUser" no-style>
              <a-select
                v-model:value="form.approverUser"
                placeholder="请选择审批人"
                mode="multiple"
              >
                <a-select-option value="1">张三</a-select-option>
                <a-select-option value="2">李四</a-select-option>
              </a-select>
            </a-form-item>
          </a-space-compact>
        </a-space>
      </a-form-item>
      <a-form-item label="驳回处理方式" name="rejectType">
        <a-radio-group v-model:value="form.rejectType">
          <a-radio value="1">直接结束</a-radio>
          <a-radio value="2" disabled>返回上节点</a-radio>
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
    approvalType: undefined,
    approverRole: [],
    approverUser: [],
    rejectType: '1',
  });
  const rules = {
    approverRole: [{ required: true, message: '请选择审批角色' }],
    approverUser: [{ required: true, message: '请选择审批人' }],
    approvalType: [{ required: true, message: '请选择审批类型' }],
    rejectType: [{ required: true, message: '请选择驳回处理方式' }],
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
        console.log('elementData.value', newVal);
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
