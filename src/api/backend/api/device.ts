import { request, type RequestOptions } from '@/utils/request';

// 装置相关

// 获取装置列表
export async function getDeviceList(projectId: string, options?: RequestOptions) {
  return request<any>({
    url: '/api/device/list',
    method: 'GET',
    params: { projectId },
  });
}

// 添加装置
export async function addDevice(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/device/data',
    method: 'POST',
    data: params,
  });
}

// 更新装置
export async function updateDevice(params: any, options?: RequestOptions) {
  return request<any>({
    url: `/api/device/data`,
    method: 'PUT',
    data: params,
  });
}

// 删除装置
export async function deleteDevice(id: string, code: string, options?: RequestOptions) {
  return request<any>({
    url: `/api/device/data`,
    method: 'DELETE',
    params: { id, code },
  });
}
