import { request, type RequestOptions } from '@/utils/request';

// 依据应用模板id和userId获取应用数据
export async function getApplicationData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/data',
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 保存应用数据
export async function saveApplicationData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/data',
    method: 'POST',
    data: params,
  });
}
