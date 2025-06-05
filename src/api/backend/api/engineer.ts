import { request, type RequestOptions } from '@/utils/request';

// 工程相关

// 获取工程列表
export async function getEngineerList(
  projectCode: string,
  deviceId: string,
  options?: RequestOptions,
) {
  return request<any>({
    url: '/api/engineer/list',
    method: 'GET',
    params: { projectCode, deviceId },
  });
}

// 添加工程
export async function addEngineer(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/engineer/data',
    method: 'POST',
    data: params,
  });
}

// 更新工程
export async function updateEngineer(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/engineer/data',
    method: 'PUT',
    data: params,
  });
}

// 删除工程
export async function deleteEngineer(id: string, options?: RequestOptions) {
  return request<any>({
    url: '/api/engineer/data',
    method: 'DELETE',
    params: { id },
  });
}
