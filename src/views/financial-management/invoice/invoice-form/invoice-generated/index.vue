<template>
  <a-descriptions :column="3">
    <a-descriptions-item label="合同票金额合计" :contentStyle="{ flexDirection: 'column' }">
      <a-statistic
        :value="amountData.contractAmount"
        suffix="万元"
        :value-style="{ color: '#f5222d', fontSize: '16px' }"
      />
      <a-descriptions :column="1" title="其中费用细分">
        <a-descriptions-item label="基本费用">
          {{ amountData.basicAmount }}
        </a-descriptions-item>
        <a-descriptions-item label="效益费用">
          {{ amountData.benefitAmount }}
        </a-descriptions-item>
      </a-descriptions>
    </a-descriptions-item>
    <a-descriptions-item label="合同已确认产值">
      {{
        invoiceStore.invoiceProductData.table[0]?.['服务费 -单价\总价计算明细/n咨询费总价'] || '--'
      }}
    </a-descriptions-item>
  </a-descriptions>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { useInvoiceStore } from '@/store/modules/invioce';

  const props = defineProps<{
    formState: any;
  }>();

  const invoiceStore = useInvoiceStore();
  const amountData = ref<any>({});

  watch(
    () => props.formState.contractCode,
    (val) => {
      const project = invoiceStore.invoiceApplicationData.table.find(
        (item) => item['合同编号'] === val,
      );
      if (project) {
        amountData.value = {
          contractAmount: project['合同金额\n（万元）'],
          basicAmount: project['收费标准基础费\n（元/%)'],
          benefitAmount: project['收费标准效益费\n（元/%）'],
        };
      }
    },
    {
      immediate: true,
    },
  );
</script>
