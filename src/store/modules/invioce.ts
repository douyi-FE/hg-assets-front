import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

// 弘庚咨询；北宸石化；庚远信息；北京福陆；青矩工程；瀚景；
export const useInvoiceStore = defineStore('invoice', () => {
  const invoiceOrgList = ref<any[]>([
    {
      label: '弘庚咨询',
      value: '弘庚咨询',
    },
    {
      label: '北宸石化',
      value: '北宸石化',
    },
    {
      label: '庚远信息',
      value: '庚远信息',
    },
    {
      label: '北京福陆',
      value: '北京福陆',
    },
    {
      label: '青矩工程',
      value: '青矩工程',
    },
    {
      label: '瀚景',
      value: '瀚景',
    },
  ]);

  // 基本费；效益费；其它费
  const invoiceFeeType = ref<any[]>([
    {
      label: '基本费',
      value: '基本费',
    },
    {
      label: '效益费',
      value: '效益费',
    },
    {
      label: '其它费',
      value: '其它费',
    },
  ]);

  // 支付方式：汇款；现金；承兑；其它
  const invoicePayType = ref<any[]>([
    {
      label: '汇款',
      value: '汇款',
    },
    {
      label: '现金',
      value: '现金',
    },
    {
      label: '承兑',
      value: '承兑',
    },
    {
      label: '其它',
      value: '其它',
    },
  ]);

  // 核算方法：费率；固定单价；固定总价
  const invoiceContractType = ref<any[]>([
    {
      label: '费率',
      value: '费率',
    },
    {
      label: '固定单价',
      value: '固定单价',
    },
    {
      label: '固定总价',
      value: '固定总价',
    },
  ]);
  // 发票类型
  const invoiceType = ref<any[]>([
    {
      label: '增值税专用发票（数电专票（电子）9%）',
      value: 'sjzp0.09',
    },
    {
      label: '增值税普通发票（数电普票（电子）0%）',
      value: 'sjpp0.00',
    },
    {
      label: '增值税普通发票（数电普票（电子）6%）',
      value: 'sjpp0.06',
    },
    {
      label: '增值税专用发票（数电专票（电子）6%）',
      value: 'sjzp0.06',
    },
    {
      label: '其他发票',
      value: 'other',
    },
  ]);
  // 发票内容
  const invoiceContent = ref<any[]>([
    {
      label: '审计费',
      value: '审计费',
    },
    {
      label: '鉴证咨询服务',
      value: '鉴证咨询服务',
    },
    {
      label: '咨询服务费',
      value: '咨询服务费',
    },
    {
      label: '咨询费',
      value: '咨询费',
    },
    {
      label: '代理服务费',
      value: '代理服务费',
    },
    {
      label: '造价咨询费',
      value: '造价咨询费',
    },
    {
      label: '造价咨询服务费',
      value: '造价咨询服务费',
    },
    {
      label: '审计服务费',
      value: '审计服务费',
    },
    {
      label: '审价服务费',
      value: '审价服务费',
    },
    {
      label: '结算审核费用',
      value: '结算审核费用',
    },
    {
      label: '项目管理费',
      value: '项目管理费',
    },
    {
      label: '工程监理服务费',
      value: '工程监理服务费',
    },
    {
      label: '设计费',
      value: '设计费',
    },
    {
      label: '技术培训费',
      value: '技术培训费',
    },
    {
      label: '其他咨询服务',
      value: '其他咨询服务',
    },
    {
      label: '咨询费(不含鉴证)',
      value: '咨询费(不含鉴证)',
    },
    {
      label: '行业应用软件产品',
      value: '行业应用软件产品',
    },
    {
      label: '软件开发服务',
      value: '软件开发服务',
    },
    {
      label: '信息系统服务',
      value: '信息系统服务',
    },
    {
      label: '研发服务',
      value: '研发服务',
    },
    {
      label: '研发和技术服务',
      value: '研发和技术服务',
    },
    {
      label: '软件',
      value: '软件',
    },
    {
      label: '信息技术服务',
      value: '信息技术服务',
    },
  ]);
  // 取票方式：自取，邮寄，不取
  const invoiceTicketType = ref<any[]>([
    {
      label: '自取',
      value: '自取',
    },
    {
      label: '邮寄',
      value: '邮寄',
    },
    {
      label: '不取',
      value: '不取',
    },
  ]);
  // 应用数据
  const invoiceApplicationData = ref<any>({});
  // 产值表
  const invoiceProductData = ref<any>({});

  const setInvoiceApplicationData = (data: any) => {
    invoiceApplicationData.value = data;
  };

  const setInvoiceProductData = (data: any) => {
    invoiceProductData.value = data;
  };

  const projectList = computed(() => {
    return invoiceApplicationData.value.table
      .filter((item) => Boolean(item['项目名称']))
      .map((item) => ({
        label: item['项目名称'],
        value: item['项目编号'] || item['项目名称'],
        type: item['合同类型'],
        contractCode: item['合同编号'],
        contractName: item['合同名称'],
        manager: item['乙方项目经理'],
      }));
  });

  const contractList = computed(() => {
    return invoiceApplicationData.value.table
      .filter((item) => Boolean(item['合同编号']))
      .map((item) => ({
        label: item['合同编号'],
        value: item['合同编号'],
        name: item['合同名称'],
      }));
  });

  return {
    invoiceOrgList,
    invoiceFeeType,
    invoicePayType,
    invoiceApplicationData,
    setInvoiceApplicationData,
    projectList,
    contractList,
    invoiceContractType,
    invoiceProductData,
    setInvoiceProductData,
    invoiceType,
    invoiceContent,
    invoiceTicketType,
  };
});
