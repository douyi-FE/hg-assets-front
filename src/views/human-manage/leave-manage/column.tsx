import dayjs from 'dayjs';
import { message } from 'ant-design-vue';
import type { TableColumn } from '@/components/core/dynamic-table';
import { deleteLeave } from '@/api/backend/api/leave';
import { eventBus } from '@/utils/event-bus';

export type TableListItem = API.LeaveListItem;
export type TableColumnItem = TableColumn<TableListItem>;

export const baseColumns: TableColumnItem[] = [
  {
    title: '#',
    dataIndex: 'index',
    width: 55,
    hideInSearch: true,
  },
  {
    title: '休假类型',
    width: 200,
    dataIndex: 'leaveType',
    customRender: ({ record }) => {
      return record.leaveType === 'annual' ? '年假' : record.leaveType === 'sick' ? '病假' : '事假';
    },
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '申请人',
    width: 200,
    dataIndex: 'employeeName',
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '开始日期',
    width: 120,
    dataIndex: 'startDate',
    hideInSearch: true,
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '结束日期',
    width: 120,
    dataIndex: 'endDate',
    hideInSearch: true,
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '请假天数',
    width: 80,
    dataIndex: 'duration',
    hideInSearch: true,
    customRender: ({ record }) => {
      return dayjs(record.endDate).diff(dayjs(record.startDate), 'day');
    },
    formItemProps: {
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '请假原因',
    width: 200,
    dataIndex: 'reason',
    hideInSearch: true,
  },
  {
    title: '当前节点',
    width: 200,
    dataIndex: 'flowExecute',
    hideInSearch: true,
    customRender: ({ value }) => {
      return value.map((item) => item.name).join(';') || '--';
    },
  },
  {
    title: '审批状态',
    width: 80,
    dataIndex: 'approverStatus',
    customRender: ({ record }) => {
      return record.approverStatus === 'pending'
        ? '审批中'
        : record.approverStatus === 'approved'
          ? '已完成'
          : '已驳回';
    },
    formItemProps: {
      component: 'Select',
      componentProps: {
        options: [
          {
            label: '审批中',
            value: 'pending',
          },
          {
            label: '已完成',
            value: 'approved',
          },
          {
            label: '已驳回',
            value: 'rejected',
          },
        ],
      },
      colProps: {
        span: 4,
      },
    },
  },
  {
    title: '操作',
    width: 220,
    dataIndex: 'ACTION',
    hideInSearch: true,
    fixed: 'right',
    actions: ({ record }: { record: any }) => [
      {
        label:
          record.flowExecute && record.flowExecute.find((item) => item.name === '发起申请')
            ? '发起'
            : '审批',
        disabled: !record.hasPermission,
        onClick: () => {
          eventBus.emit('approve-flow-execute', record);
        },
      },
      {
        label: '驳回',
        disabled: record.approverStatus === 'reject' || record.approverStatus === 'approved',
        popConfirm: {
          title: '你确定要驳回吗？',
          placement: 'left',
          onConfirm: () => {
            console.log(record);
            eventBus.emit('reject-flow-execute', record);
          },
        },
      },
      {
        label: '删除',
        popConfirm: {
          title: '你确定要删除吗？',
          placement: 'left',
          onConfirm: () => {
            console.log(record);
            deleteLeave({
              id: (record as any)._id,
            }).then((res) => {
              message.success('删除成功');
              eventBus.emit('leave-reload');
            });
          },
        },
      },
    ],
  },
];
