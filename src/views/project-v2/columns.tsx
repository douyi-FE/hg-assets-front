import type { TableColumn } from '@/components/core/dynamic-table';

export type TableListItem = API.TemplateItem;
export type TableColumnItem = TableColumn<TableListItem>;

// 项目字段
export const projectColumns: TableColumnItem[] = [
  {
    title: '#',
    dataIndex: 'index',
    width: 55,
    customRender({ index }) {
      return index + 1;
    },
  },
  {
    title: '项目名称',
    dataIndex: 'project_name',
  },
  {
    title: '项目编号',
    dataIndex: 'project_code',
  },
  {
    title: '项目名称',
    dataIndex: 'project_name',
  },
  {
    title: '合同名称',
    dataIndex: 'contract_name',
  },
  {
    title: '合同甲方',
    dataIndex: 'contract_party_a',
  },
  {
    title: '合同乙方',
    dataIndex: 'contract_party_b',
  },
  {
    title: '行业',
    dataIndex: 'industry',
  },
  {
    title: '签订日期',
    dataIndex: 'sign_date',
  },
  {
    title: '合同金额',
    dataIndex: 'contract_amount',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
];

// 设备字段
export const deviceColumns = [
  {
    title: '#',
    dataIndex: 'index',
    width: 55,
    customRender({ index }) {
      return index + 1;
    },
  },
  {
    title: '设备名称',
    dataIndex: 'name',
  },
  {
    title: '设备编号',
    dataIndex: 'code',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
];

// 工程字段
export const engineerColumns = [
  {
    title: '#',
    dataIndex: 'index',
    width: 55,
    customRender({ index }) {
      return index + 1;
    },
  },
  {
    title: '工程名称',
    dataIndex: 'name',
  },
  {
    title: '工程编号',
    dataIndex: 'code',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
];
