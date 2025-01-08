import { request } from '@/utils/request';

// excel相关

export async function getFlowDesignList(params: any) {
  return request<any>({
    url: '/api/flow/design/list',
    method: 'GET',
    params,
  });
}

export async function saveFlowDesign(params: any) {
  return request<any>({
    url: '/api/flow/design/save',
    method: 'POST',
    data: params,
  });
}

export async function getFlowDesignDetail(params: any) {
  return request<any>({
    url: '/api/flow/design/find',
    method: 'GET',
    params,
  });
}

export async function deleteFlowDesign(params: any) {
  return request<any>({
    url: '/api/flow/design/delete',
    method: 'DELETE',
    params: {
      id: params.id,
    },
  });
}
