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
    width: 200,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 250,
    hideInSearch: true,
  },
  {
    title: '更新时间',
    dataIndex: 'updatedAt',
    width: 250,
    hideInSearch: true,
  },
];
