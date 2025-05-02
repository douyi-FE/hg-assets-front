import { request, type RequestOptions } from '@/utils/request';

// 应用相关

export async function getApplicationList(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/list',
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 根据ids获取应用列表
export async function getApplicationByIds(ids: string[], options?: RequestOptions) {
  return request<any>({
    url: '/api/application/list',
    method: 'GET',
    params: { templateId: { $in: ids } },
    ...(options || {}),
  });
}

export async function getApplicationById(id: string, options?: RequestOptions) {
  return request<any>({
    url: `/api/application/${id}`,
    method: 'GET',
    ...(options || {}),
  });
}

export async function getApplicationByName(name: string, options?: RequestOptions) {
  return request<any>({
    url: `/api/application/name/${name}`,
    method: 'GET',
    ...(options || {}),
  });
}
// 根据id更新应用
export async function updateApplicationById(params: any, options?: RequestOptions) {
  return request<any>({
    url: `/api/application/${params.id}`,
    method: 'PUT',
    data: params,
    ...(options || {}),
  });
}
export async function publishApplication(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/publish',
    method: 'POST',
    data: params,
    ...(options || {}),
  });
}
