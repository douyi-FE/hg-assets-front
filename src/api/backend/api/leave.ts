import { request, type RequestOptions } from '@/utils/request';

// 获取请假列表
export const getLeaveList = async (params: any, options?: RequestOptions) => {
  return request<any>({
    url: '/api/leave/list',
    method: 'GET',
    params,
    ...(options || {}),
  }).then((res) => {
    return res;
  });
};

// 新增请假
export const createLeave = async (data: any) => {
  const res = await request<any>({
    url: '/api/leave/create',
    method: 'POST',
    data,
  });
  return res;
};

// 删除请假
export const deleteLeave = async (data: any) => {
  const res = await request<any>({
    url: '/api/leave/delete',
    method: 'DELETE',
    data,
  });
  return res;
};

// 获取请假详情
export const getLeaveDetail = async (data: any) => {
  const res = await request<any>({
    url: '/api/leave/detail',
    method: 'GET',
    data,
  });
  return res;
};

// 审批请假
export const approveLeave = async (data: any) => {
  const res = await request<any>({
    url: '/api/leave/approve',
    method: 'POST',
    data,
  });
  return res;
};

// 驳回请假
export const rejectLeave = async (data: any) => {
  const res = await request<any>({
    url: '/api/leave/reject',
    method: 'POST',
    data,
  });
  return res;
};

// 获取请假统计
export const getLeaveStatistics = async () => {
  const res = await request<any>({
    url: '/api/leave/statistics',
    method: 'GET',
  });
  return res;
};

// 更新请假
export const updateLeave = async (data: any) => {
  const res = await request<any>({
    url: '/api/leave/update',
    method: 'POST',
    data,
  });
  return res;
};
