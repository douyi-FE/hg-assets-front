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

// 根据应用模板id和userId更新应用数据
export async function updateApplicationData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/data',
    method: 'PUT',
    data: params,
  });
}

// 追加数据
export async function appendApplicationData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/data/append',
    method: 'POST',
    data: params,
  });
}

// 获取模板字段取值字典
export async function getTemplateFieldDict(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/template-field-dict',
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 获取模板字段多列取值字典
export async function getTemplateFieldMultiDict(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/template-field-multi-dict',
    method: 'GET',
    params,
    ...(options || {}),
  });
}
