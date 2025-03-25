<!-- 审批抽屉 -->
<template>
  <div>
    <a-drawer
      :title="`${data.applyCode} 审批记录`"
      :visible="isOpen"
      @close="handleClose"
      width="700px"
    >
      <a-timeline>
        <a-timeline-item v-for="item in approvalRecordList" :key="item.id">
          <a-row>
            <a-col :span="6">环节：{{ item.approvalType }}</a-col>
            <a-col :span="6">发起人：{{ item.initiator }}</a-col>
            <a-col :span="6">审批结果：{{ item.result }}</a-col>
            <a-col :span="6">发起时间：{{ item.approvalDate }}</a-col>
            <a-col :span="24" style="padding: 10px; background-color: #f5f5f5"
              >审批意见：{{ item.opinion }}</a-col
            >
          </a-row>
        </a-timeline-item>
      </a-timeline>
    </a-drawer>
  </div>
</template>

<script setup lang="ts">
  import { watch, ref } from 'vue';
  import { getApprovalRecord } from '@/api/backend/api/flowApproval';
  const props = defineProps<{
    isOpen: boolean;
    data: any;
  }>();

  const emit = defineEmits<{
    (e: 'update:isOpen', isOpen: boolean): void;
  }>();

  const approvalRecordList = ref<any[]>([]);

  const handleClose = () => {
    emit('update:isOpen', false);
  };

  const getApprovalRecordList = async () => {
    const res = await getApprovalRecord({ processId: props.data.processId });
    console.log(res);
    approvalRecordList.value = res.result;
  };

  watch(
    () => props.isOpen,
    (newVal) => {
      if (newVal) {
        getApprovalRecordList();
      }
    },
  );
</script>
