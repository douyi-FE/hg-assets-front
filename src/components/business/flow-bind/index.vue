<template>
  <div v-if="isShowFlowBindSetting">
    <a-modal v-model:open="isOpenFlowSetting" title="请选择流程" @ok="setFlow">
      <a-form
        ref="applicationNameRef"
        :model="formState"
        :rules="{
          flowId: [{ required: true, message: '请选择流程', trigger: 'change' }],
        }"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
      >
        <a-form-item label="流程名称" name="flowId">
          <a-select v-model:value="formState.flowId" placeholder="请选择流程">
            <a-select-option v-for="item in flowList" :key="item._id" :value="item._id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-float-button
      type="primary"
      shape="square"
      description="流程绑定"
      @click="isOpenFlowSetting = true"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { bindFlow } from '@/api/backend/api/flowBind';
  import { getFlowDesignList } from '@/api/backend/api/flowDesign';

  const props = defineProps({
    isShowFlowBindSetting: {
      type: Boolean,
      default: false,
    },
    module: {
      type: String,
      default: '',
    },
  });

  const emit = defineEmits(['update:modelValue', 'bind-success']);
  const isOpenFlowSetting = ref(false);
  const applicationNameRef = ref();
  const formState = ref({
    flowId: '',
  });
  const flowList = ref<any[]>([]);

  const setFlow = async function () {
    applicationNameRef.value.validate().then(async () => {
      const flowName = flowList.value.find((item) => item._id === formState.value.flowId)?.name;
      bindFlow({
        flowId: formState.value.flowId,
        flowName,
        module: props.module,
      }).then(() => {
        isOpenFlowSetting.value = false;
        emit('update:modelValue', false);
        emit('bind-success');
      });
    });
  };

  const fetchFlow = async function () {
    getFlowDesignList({}).then((res) => {
      flowList.value = res;
    });
  };

  onMounted(() => {
    fetchFlow();
  });
</script>
