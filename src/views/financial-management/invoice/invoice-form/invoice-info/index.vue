<!-- eslint-disable vue/no-mutating-props -->
<!-- 发票信息 -->

<template>
  <a-row :gutter="24" justify="start">
    <a-col :span="12">
      <a-form-item ref="code" label="发票类型：" name="invoiceType" required>
        <a-select v-model:value="formState.invoiceType" placeholder="请选择发票类型">
          <a-select-option
            v-for="item in invoiceStore.invoiceType"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="发票抬头" name="invoiceTitle" required>
        <a-input v-model:value="formState.invoiceTitle" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item ref="code" label="发票内容：" name="invoiceContent" required>
        <a-select v-model:value="formState.invoiceContent" placeholder="请选择发票内容">
          <a-select-option
            v-for="item in invoiceStore.invoiceContent"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="规格型号" name="specificationAndModel">
        <a-input v-model:value="formState.specificationAndModel" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="计量单位" name="unit">
        <a-input v-model:value="formState.unit" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="数量" name="quantity">
        <a-input v-model:value="formState.quantity" type="number" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="单价(含税元)" name="unitPrice">
        <a-input v-model:value="formState.unitPrice" type="number" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="开票金额（元）" name="invoiceAmount" required>
        <a-input v-model:value="formState.invoiceAmount" type="number" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item
        label="客户单位纳税登记号"
        name="customerTaxRegistrationNumber"
        required
        tooltip="开具普通发票且客户无需填写税号时，此处录入“000000000000000000”"
      >
        <a-input v-model:value="formState.customerTaxRegistrationNumber" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="客户地址" name="customerAddress">
        <a-input v-model:value="formState.customerAddress" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="客户电话" name="customerPhone">
        <a-input v-model:value="formState.customerPhone" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="客户开户行" name="customerBank">
        <a-input v-model:value="formState.customerBank" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="客户开户行账号" name="customerBankAccount">
        <a-input v-model:value="formState.customerBankAccount" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="预计回款时间" name="expectedPaymentTime">
        <a-date-picker
          v-model:value="formState.expectedPaymentTime"
          :format="formatDate"
          picker="year"
        />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="电子邮箱" name="email" required>
        <a-input v-model:value="formState.email" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="发票备注栏信息" name="invoiceRemark">
        <a-textarea v-model:value="formState.invoiceRemark" />
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import dayjs from 'dayjs';
  import { useInvoiceStore } from '@/store/modules/invioce';

  const invoiceStore = useInvoiceStore();

  defineProps<{
    formState: any;
  }>();

  const formatDate = (value: any) => {
    return dayjs(value).format('YYYY');
  };
</script>
