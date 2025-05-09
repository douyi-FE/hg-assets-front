import { request } from '@/utils/request';

// 流程执行相关

// 获取流程执行列表
export async function getFlowExecuteList(params: any) {
  return request<any>({
    url: '/api/flow/execute/list',
    method: 'GET',
    params,
  });
}

// 创建流程
export async function createFlowExecute(params: any) {
  return request<any>({
    url: '/api/flow/execute/create',
    method: 'POST',
    data: params,
  });
}

// 驳回流程
export async function rejectFlowExecute(params: any) {
  return request<any>({
    url: '/api/flow/execute/reject',
    method: 'POST',
    data: params,
  });
}

// 审批流程
export async function approveFlowExecute(params: any) {
  return request<any>({
    url: '/api/flow/execute/approve',
    method: 'POST',
    data: params,
  });
}
