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
    title: '名称',
    dataIndex: 'name',
    width: 300,
    resizable: true,
    formItemProps: {
      defaultValue: '',
      required: true,
    },
  },
  {
    title: '甲方',
    dataIndex: 'owner',
    width: 300,
    resizable: true,
    formItemProps: {
      defaultValue: '',
      required: true,
    },
  },
  {
    title: '乙方',
    dataIndex: 'contractor',
    width: 300,
    resizable: true,
  },
  {
    title: '负责人',
    dataIndex: 'charger',
    width: 100,
    resizable: true,
  },
  {
    title: '所在省',
    dataIndex: 'province',
    width: 300,
    resizable: true,
  },
  {
    title: '所在市',
    dataIndex: 'city',
    width: 300,
    resizable: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createdAt',
    width: 300,
    resizable: true,
  },
  {
    title: '修改时间',
    dataIndex: 'modifyAt',
    width: 300,
    resizable: true,
  },
  {
    title: '操作',
    dataIndex: 'operator',
  },
];
