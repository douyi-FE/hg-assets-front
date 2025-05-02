import type { TableColumn } from '@/components/core/dynamic-table';

export type TableListItem = API.TemplateItem;
export type TableColumnItem = TableColumn<TableListItem>;

// 项目字段
export const projectColumns: TableColumnItem[] = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 55,
    customRender({ index }) {
      return index + 1;
    },
  },
  {
    title: '项目名称',
    dataIndex: '项目名称',
  },
  {
    title: '项目编号',
    dataIndex: '项目编号',
    width: 150,
  },
  {
    title: '合同名称',
    dataIndex: '合同名称',
  },
  {
    title: '合同甲方',
    dataIndex: '合同甲方',
  },
  {
    title: '合同乙方',
    dataIndex: '合同乙方',
  },
  {
    title: '行业',
    dataIndex: '行业',
  },
  {
    title: '签订日期',
    dataIndex: 'sign_date',
  },
  {
    title: '合同金额\n（万元）',
    dataIndex: '合同金额\n（万元）',
  },
];

// 设备字段
export const deviceColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 55,
    customRender({ index }) {
      return index + 1;
    },
  },
  {
    title: '装置名称',
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
    title: '序号',
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

// 工程数据字段
export const engineerDataColumns = [
  {
    title: '类型',
    dataIndex: 'type',
  },
  {
    title: '编码',
    dataIndex: 'code',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
];
