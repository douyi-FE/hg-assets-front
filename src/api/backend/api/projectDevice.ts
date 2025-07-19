import { request, type RequestOptions } from '@/utils/request';

// 根据 type, project, device, engineer 获取项目设备信息
export async function getProjectDevice(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/project-device/data',
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 保存应用数据
export async function saveProjectDevice(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/project-device/data',
    method: 'POST',
    data: params,
  });
}

// 根据应用模板id和userId更新应用数据
export async function updateProjectDevice(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/project-device/data',
    method: 'PUT',
    data: params,
  });
}

// 清空指定用户的样式文件
export async function clearProjectDeviceStyles(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/project-device/clear-styles',
    method: 'POST',
    data: params,
  });
}

// 清空所有样式文件
export async function clearAllProjectDeviceStyles(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/project-device/clear-all-styles',
    method: 'POST',
    data: params,
  });
}
