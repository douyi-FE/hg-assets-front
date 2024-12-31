<template>
  <div class="generate-container">
    <CustomTable
      :columns="columns"
      :data-source="invoiceList"
      :is-loading="isLoading"
      title="发票列表"
      :search-fields="searchModel"
      @refresh="fetchInvoiceList"
      @search-model-change="searchChangeHander"
    >
      <template #tableHeaderGrooup>
        <a-button
          type="primary"
          size="small"
          :icon="h(PlusOutlined)"
          @click="isOpenInvoiceDialog = true"
          >新增</a-button
        >
      </template>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'InvoiceApplyCode'">
          <a-button
            type="link"
            @click="
              () => {
                isShowDetail = true;
                curInvioce = record;
              }
            "
            >{{ record.InvoiceApplyCode }}</a-button
          >
        </template>
      </template>
    </CustomTable>
    <a-drawer
      v-model:open="isShowDetail"
      class="custom-class"
      size="large"
      root-class-name="invoice-detail"
      style="color: red"
      title="发票详情"
      placement="right"
      @after-open-change="afterOpenChange"
    >
      <a-descriptions title="项目信息">
        <a-descriptions-item label="申请编号">{{
          curInvioce.InvoiceApplyCode
        }}</a-descriptions-item>
        <a-descriptions-item label="项目编号">{{ curInvioce.ProjectCode }}</a-descriptions-item>
        <a-descriptions-item label="项目负责人">Hangzhou, Zhejiang</a-descriptions-item>
        <a-descriptions-item label="业务类型">--</a-descriptions-item>
        <a-descriptions-item label="所属部门">
          No. 18, Wantang Road, Xihu District, Hangzhou, Zhejiang, China
        </a-descriptions-item>
        <a-descriptions-item label="核算方法">--</a-descriptions-item>
        <a-descriptions-item label="合同编号">{{ curInvioce.ContractCode }}</a-descriptions-item>
        <a-descriptions-item label="合同名称">--</a-descriptions-item>
        <a-descriptions-item label="开票机构">--</a-descriptions-item>
        <a-descriptions-item label="开票费用类别">--</a-descriptions-item>
        <a-descriptions-item label="支付方式">--</a-descriptions-item>
        <a-descriptions-item label="付款申请附件">empty</a-descriptions-item>
      </a-descriptions>
      <a-descriptions title="发票信息">
        <a-descriptions-item label="发票类型">{{ curInvioce.InvoiceTypeName }}</a-descriptions-item>
      </a-descriptions>
      <a-descriptions title="流转登记信息">
        <a-descriptions-item label="邮寄方式">邮寄</a-descriptions-item>
      </a-descriptions>
    </a-drawer>
    <a-modal v-model:open="isOpenInvoiceDialog" title="申请开票" :footer="null" width="1000px">
      <CreateInvode />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, h } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { columns } from './columns';
  import CreateInvode from './create-invoice/index.vue';
  import { getInvoiceList } from '@/api/invoice/list';
  import CustomTable from '@/components/core/custom-table/table.vue';

  const searchModel = ref({
    InvoiceApplyCode: '',
    ProjectCode: '',
  });
  const invoiceList = ref<Array<any>>([]);
  const isLoading = ref(false);
  const isShowDetail = ref(false);
  const curInvioce = ref<{ [key: string]: any }>({});
  const isOpenInvoiceDialog = ref(false);

  const fetchInvoiceList = function (params) {
    isLoading.value = true;
    getInvoiceList(params)
      .then((res: any) => {
        invoiceList.value = res.data;
      })
      .finally(() => {
        isLoading.value = false;
      });
  };
  const afterOpenChange = function () {
    console.log('hhh');
  };
  const searchChangeHander = function (filterParams) {
    fetchInvoiceList(filterParams);
  };
  onMounted(() => {
    fetchInvoiceList(searchModel.value);
  });
</script>

<style lang="less" scoped></style>
