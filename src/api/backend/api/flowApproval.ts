import { request } from '@/utils/request';

// 获取审批记录
export const getApprovalRecord = (params: any) => {
  return request<any>({
    url: '/api/flow-approval/info',
    method: 'GET',
    params,
  });
};
