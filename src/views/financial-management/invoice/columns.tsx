import { Tag } from 'ant-design-vue';
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
  status: string;
};
// 使用TableColumn<ListItemType> 将会限制dataIndex的类型，但换来的是dataIndex有类型提示
export const columns: TableColumn<ListItemType>[] = [
  {
    title: '申请编号',
    dataIndex: 'applyCode',
    width: 200,
    resizable: true,
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '原发票编号',
    dataIndex: 'InvoiceCode',
    width: 200,
    resizable: true,
    hideInSearch: true,
  },
  {
    title: '发票编号',
    dataIndex: 'InvoiceCode',
    width: 200,
    resizable: true,
    hideInSearch: true,
  },
  {
    title: '发票类型',
    dataIndex: 'invoiceType',
    width: 300,
    resizable: true,
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '项目名称',
    dataIndex: 'name',
    width: 300,
    resizable: true,
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '开票机构',
    dataIndex: 'anency',
    width: 300,
    resizable: true,
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '发票抬头',
    dataIndex: 'invoiceTitle',
    width: 300,
    resizable: true,
    hideInSearch: true,
  },
  {
    title: '合同编号',
    dataIndex: 'contractCode',
    resizable: true,
    hideInSearch: true,
  },
  {
    title: '开票金额',
    dataIndex: 'invoiceAmount',
    resizable: true,
    hideInSearch: true,
  },
  {
    title: '状态',
    dataIndex: 'status',
    resizable: true,
    hideInSearch: false,
    customRender: ({ record }) => (
      <Tag
        color={
          record.status === 'draft' ? 'blue' : record.status === 'pending' ? 'orange' : 'green'
        }
      >
        {record.status === 'draft' ? '草稿' : record.status === 'pending' ? '审批中' : '已审批'}
      </Tag>
    ),
  },
];
