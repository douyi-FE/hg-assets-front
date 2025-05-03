import { request, type RequestOptions } from '@/utils/request';

export async function getTemplateFieldDict(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/template-field-dict/data',
    method: 'GET',
    params,
    ...(options || {}),
  });
}

export async function saveTemplateFieldDict(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/template-field-dict/data',
    method: 'POST',
    data: params,
  });
}

