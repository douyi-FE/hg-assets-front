<template>
  <a-drawer
    :open="isOpen"
    @update:open="$emit('update:isOpen', $event)"
    class="custom-class"
    size="large"
    root-class-name="invoice-detail"
    title="发票详情"
    placement="right"
    @after-open-change="afterOpenChange"
  >
    <a-descriptions title="项目信息">
      <a-descriptions-item label="申请编号">{{ data.InvoiceApplyCode }}</a-descriptions-item>
      <a-descriptions-item label="项目编号">{{ data.ProjectCode }}</a-descriptions-item>
      <a-descriptions-item label="项目负责人">Hangzhou, Zhejiang</a-descriptions-item>
      <a-descriptions-item label="业务类型">--</a-descriptions-item>
      <a-descriptions-item label="所属部门">
        No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
      </a-descriptions-item>
      <a-descriptions-item label="核算方法">--</a-descriptions-item>
      <a-descriptions-item label="合同编号">{{ data.ContractCode }}</a-descriptions-item>
      <a-descriptions-item label="合同名称">--</a-descriptions-item>
      <a-descriptions-item label="开票机构">--</a-descriptions-item>
      <a-descriptions-item label="开票费用类别">--</a-descriptions-item>
      <a-descriptions-item label="支付方式">--</a-descriptions-item>
      <a-descriptions-item label="付款申请附件">empty</a-descriptions-item>
    </a-descriptions>
    <a-descriptions title="发票信息">
      <a-descriptions-item label="发票类型">{{ data.InvoiceTypeName }}</a-descriptions-item>
    </a-descriptions>
    <a-descriptions title="流转登记信息">
      <a-descriptions-item label="邮寄方式">邮寄</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
  defineProps<{
    isOpen: boolean;
    data: any;
  }>();

  const afterOpenChange = function () {};

  defineEmits(['update:isOpen', 'update:data']);
</script>
