<template>
  <div class="generate-container">
    <DynamicTable
      row-key="id"
      header-title="开票管理"
      title-tooltip="开票管理"
      :data-request="Api.invoice.getInvoiceList"
      :columns="columns"
      bordered
      size="small"
    >
      <template #bodyCell="{ column, index }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
      </template>
      <template #toolbar>
        <a-button
          type="primary"
          :disabled="!$auth('financial:invoice:create')"
          @click="openMenuModal()"
        >
          新增
        </a-button>
      </template>
    </DynamicTable>
    <InvoiceDrawer ref="invoiceDrawerRef" v-model:isOpen="isShowDetail" v-model:data="curInvioce" />
    <CreateInvode v-model:isOpen="isOpenInvoiceDialog" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { columns } from './columns';
  import CreateInvode from './create-invoice/index.vue';
  import InvoiceDrawer from './invoice-drawer.vue';
  import Api from '@/api';
  import { useTable } from '@/components/core/dynamic-table';

  const [DynamicTable] = useTable();
  const isOpenInvoiceDialog = ref(false);
  const invoiceDrawerRef = ref();
  const isShowDetail = ref(false);
  const curInvioce = ref<any>({});
  const openMenuModal = () => {
    isOpenInvoiceDialog.value = true;
  };
</script>

<style lang="less" scoped></style>
