/** cad api */

import { request } from '@/utils/request';

// 获取cad列表
export async function getCadList() {
  return request<any>({
    url: '/api/cad/list',
    method: 'GET',
  });
}

// 获取cad详情
export async function getCadDetail(id: string) {
  return request<any>({
    url: `/api/cad/detail/${id}`,
    method: 'get',
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
