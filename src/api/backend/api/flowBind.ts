import { request } from '@/utils/request';

// 流程绑定

export async function bindFlow(params: any) {
  return request<any>({
    url: '/api/flow/bind/data',
    method: 'POST',
    data: params,
  });
}

export async function getFlowBindList(params: any) {
  return request<any>({
    url: '/api/flow/bind/list',
    method: 'GET',
    params,
  });
}

export async function unbindFlow(params: any) {
  return request<any>({
    url: '/api/flow/bind/unbind',
    method: 'PUT',
    params,
  });
}

// 删除流程绑定
export async function deleteFlowBind(params: any) {
  return request<any>({
    url: '/api/flow/bind/data',
    method: 'DELETE',
    params,
  });
}
