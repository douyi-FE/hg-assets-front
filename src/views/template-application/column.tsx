import type { TableColumn } from '@/components/core/dynamic-table';

export type TableListItem = API.TemplateItem;
export type TableColumnItem = TableColumn<TableListItem>;

export const baseColumns: TableColumnItem[] = [
  {
    title: '#',
    dataIndex: 'index',
    width: 55,
    hideInSearch: true,
  },
  {
    title: '应用名称',
    dataIndex: 'applicationName',
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '模板名称',
    dataIndex: 'templateName',
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
];
