import type { TableColumn } from '@/components/core/dynamic-table';
import { formatToDateTime } from '@/utils/dateUtil';

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
    title: '流程名称',
    width: 200,
    dataIndex: 'name',
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '备注',
    dataIndex: 'note',
    hideInSearch: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    hideInSearch: true,
    customRender: ({ record }) => {
      return formatToDateTime(record.createdAt);
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updateDate',
    hideInSearch: true,
    customRender: ({ record }) => {
      return formatToDateTime(record.updateAt);
    },
  },
];
