import { Tag } from 'ant-design-vue';
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
    title: '模板名称',
    width: 200,
    dataIndex: 'name',
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '是否内置',
    width: 80,
    dataIndex: 'isBuildIn',
    formItemProps: {
      colProps: {
        span: 4,
      },
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '是',
            value: 1,
          },
          {
            label: '否',
            value: 0,
          },
        ],
      },
    },
    customRender({ record }) {
      return (
        <Tag color={record.isBuildIn ? '#f50' : '#2db7f5'}>{record.isBuildIn ? '是' : '否'}</Tag>
      );
    },
  },
  {
    title: '状态',
    dataIndex: 'status',
    width: 80,
    formItemProps: {
      colProps: {
        span: 4,
      },
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '已发布',
            value: 2,
          },
          {
            label: '待发布',
            value: 1,
          },
          {
            label: '草稿',
            value: 0,
          },
        ],
      },
    },
    customRender: ({ record }) => {
      const mapStatus = {
        0: {
          text: '草稿',
          color: 'default',
        },
        1: {
          text: '待发布',
          color: 'processing',
        },
        2: {
          text: '已发布',
          color: 'green',
        },
      }[record.status];
      return <Tag color={mapStatus?.color}>{mapStatus?.text}</Tag>;
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
