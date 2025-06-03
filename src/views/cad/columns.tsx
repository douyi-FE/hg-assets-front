import type { TableColumn } from '@/components/core/dynamic-table';
export type TableListItem = API.TemplateItem;
export type TableColumnItem = TableColumn<TableListItem>;

export const baseColumns: TableColumnItem[] = [
  {
    title: '#',
    dataIndex: 'index',
    width: 80,
    hideInSearch: true,
  },
  {
    title: '名称',
    dataIndex: 'name',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 250,
    hideInSearch: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 250,
    hideInSearch: true,
  },
];
