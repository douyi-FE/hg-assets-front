import type { TableColumn } from '@/components/core/dynamic-table';

// 数据项类型
export type ListItemType = {
  charger: string;
  city: string;
  contractor: string;
  createdAt: string;
  id: string;
  modifyAt: string;
  name: string;
  owner: string;
  province: string;
};
// 使用TableColumn<ListItemType> 将会限制dataIndex的类型，但换来的是dataIndex有类型提示
export const columns: TableColumn<ListItemType>[] = [
  {
    title: '申请编号',
    dataIndex: 'InvoiceApplyCode',
    width: 200,
    resizable: true,
    formItemProps: {
      defaultValue: '',
      required: true,
    },
  },
  {
    title: '原发票编号',
    dataIndex: 'owner',
    width: 200,
    resizable: true,
    formItemProps: {
      defaultValue: '',
      required: true,
    },
  },
  {
    title: '发票编号',
    dataIndex: 'InvoiceCode',
    width: 200,
    resizable: true,
  },
  {
    title: '发票类型',
    dataIndex: 'InvoiceTypeName',
    width: 300,
    resizable: true,
  },
  {
    title: '项目编号',
    dataIndex: 'ProjectCode',
    width: 300,
    resizable: true,
  },
  {
    title: '开票机构',
    dataIndex: 'BillingUnitName',
    width: 300,
    resizable: true,
  },
  {
    title: '发票抬头',
    dataIndex: 'CustomerName',
    width: 300,
    resizable: true,
  },
  {
    title: '合同编号',
    dataIndex: 'ContractCode',
    width: 300,
    resizable: true,
  },
  {
    title: '开票金额',
    dataIndex: 'InvoiceAmount',
    width: 300,
    resizable: true,
  },
];
