/** cad api */

import { request } from '@/utils/request';

// 获取cad列表
export async function getCadList(params: any) {
  return request<any>({
    url: '/api/cad/list',
    method: 'GET',
    params,
  });
}

// 获取cad详情
export async function getCadDetail(id: string) {
  return request<any>({
    url: `/api/cad/detail`,
    method: 'get',
    params: {
      id,
    },
  });
}

// 上传cad
export async function uploadCad(data: any) {
  return request<any>({
    url: 'api/filestorage/upload',
    method: 'post',
    data,
  });
}
// 创建cad
export async function createCad(data: any) {
  return request<any>({
    url: '/api/cad/create',
    method: 'post',
    data,
  });
}

// 删除cad
export async function deleteCad(id: string) {
  return request<any>({
    url: `/api/cad/delete`,
    method: 'delete',
    data: {
      id,
    },
  });
}

// 更新cad
export async function updateCad(data: any) {
  return request<any>({
    url: '/api/cad/update',
    method: 'post',
    data,
  });
}
