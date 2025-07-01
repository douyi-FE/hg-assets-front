/** 模板数据api */

import { request } from '@/utils/request';

// 应用数据历史版本列表
export async function getApplicationDataHistoryList(params: any) {
  return request<any>({
    url: '/api/application/history/list',
    method: 'GET',
    params,
  });
}

// 应用数据历史版本添加
export async function addApplicationDataHistory(data: any) {
  return request<any>({
    url: '/api/application/history/data',
    method: 'POST',
    data,
  });
}

// 应用数据历史版本删除
export async function deleteApplicationDataHistory(data: any) {
  return request<any>({
    url: '/api/application/history/data',
    method: 'DELETE',
    data,
  });
}

// 应用数据历史版本详情
export async function getApplicationDataHistoryById(id: string) {
  return request<any>({
    url: `/api/application/history/data/${id}`,
    method: 'GET',
  });
}

// 依据id更新应用数据历史版本名称
export async function updateApplicationDataHistoryName(data: any) {
  return request<any>({
    url: `/api/application/history/data/${data.id}`,
    method: 'PUT',
    data,
  });
}
