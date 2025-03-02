import { request } from '@/utils/request';

export async function getQuickNavList(params: any) {
  return request<any>({
    url: '/api/quick-nav/list',
    method: 'GET',
    params,
  });
}

export async function updateQuickNavList(params: any) {
  return request<any>({
    url: '/api/quick-nav/update',
    method: 'PUT',
    data: params,
  });
}
