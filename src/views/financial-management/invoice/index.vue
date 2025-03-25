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
      <template #bodyCell="{ column, index, record }">
        <template v-if="column.dataIndex === 'index'">
          <span>{{ index + 1 }}</span>
        </template>
        <template v-if="column.dataIndex === 'status'">
          <Tag
            :color="
              record.status === 'draft' ? 'blue' : record.status === 'pending' ? 'orange' : 'green'
            "
            style="cursor: pointer"
            @click="openApprovalDrawer(record)"
          >
            {{
              record.status === 'draft' ? '草稿' : record.status === 'pending' ? '审批中' : '已审批'
            }}
          </Tag>
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
    <InvoiceForm
      ref="invoiceFormRef"
      v-model:isOpen="isOpenInvoiceDialog"
      @submit="submitInvodeData"
    />
    <ApprovalDrawer ref="approvalDrawerRef" v-model:isOpen="isShowApproval" :data="invoiceData" />
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message, Tag } from 'ant-design-vue';
  import { columns as baseColumns } from './columns';
  import InvoiceForm from './invoice-form/index.vue';
  import InvoiceDrawer from './invoice-drawer.vue';
  import ApprovalDrawer from './approval-drawer.vue';
  import Api from '@/api';
  import { useTable } from '@/components/core/dynamic-table';
  import { saveInvoiceData, deleteInvoiceData, submitInvoiceData } from '@/api/backend/api/invoice';
  import { useUserStore } from '@/store/modules/user';

  const [DynamicTable, dynamicTableInstance] = useTable();
  const userStore = useUserStore();
  const isOpenInvoiceDialog = ref(false);
  const invoiceFormRef = ref();
  const invoiceDrawerRef = ref();
  const approvalDrawerRef = ref();
  const isShowDetail = ref(false);
  const isShowApproval = ref(false);
  const curInvioce = ref<any>({});
  const invoiceData = ref<any>({});
  const openMenuModal = () => {
    isOpenInvoiceDialog.value = true;
  };

  const openApprovalDrawer = (data: any) => {
    invoiceData.value = data;
    isShowApproval.value = true;
  };

  const editInvodeData = (data: any) => {
    isOpenInvoiceDialog.value = true;
    const { data: invoiceData, ...rest } = data;
    invoiceFormRef.value.setFormState(rest);
  };

  const submitInvodeData = (data: any) => {
    const { code, status, ...rest } = data;
    saveInvoiceData({
      uid: userStore.userInfo.id,
      code,
      status,
      invoiceData: rest,
    }).then((res) => {
      message.success('提交成功');
      isOpenInvoiceDialog.value = false;
      dynamicTableInstance?.reload();
    });
  };

  const delRowConfirm = (record: any) => {
    deleteInvoiceData({
      code: record.applyCode,
    }).then((res) => {
      message.success('删除成功');
      dynamicTableInstance?.reload();
    });
  };

  const columns: any[] = [
    ...baseColumns,
    {
      title: '操作',
      width: 220,
      dataIndex: 'ACTION',
      hideInSearch: true,
      fixed: 'right',
      actions: ({ record }) => [
        {
          label: '编辑',
          // disabled: record.status === 2,
          onClick: () => {
            editInvodeData(record);
          },
        },
        {
          label: '提交',
          disabled: record.status === 2,
          popConfirm: {
            title: '你确定要提交吗？',
            placement: 'left',
            onConfirm: () => {
              submitInvoiceData({
                code: record.applyCode,
                flowId: '67e03293f62f43141f409741',
              }).then((res) => {
                message.success('提交成功');
                dynamicTableInstance?.reload();
              });
            },
          },
        },
        {
          label: '删除',
          disabled: record.status === 2,
          popConfirm: {
            title: '你确定要删除吗？',
            placement: 'left',
            onConfirm: () => {
              delRowConfirm(record);
            },
          },
        },
      ],
    },
  ];

  console.log('columns', columns);
</script>

<style lang="less" scoped></style>
