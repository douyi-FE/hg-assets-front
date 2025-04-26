import { request } from '@/utils/request';

export async function getProjectList(params: any) {
  return request<any>({
    url: '/api/project/list',
    method: 'GET',
    params,
  });
}

export async function createProject(data: any) {
  return request({
    url: '/api/project/data',
    method: 'POST',
    data,
  });
}

export async function deleteProject(id: string) {
  return request({
    url: '/api/project/data',
    method: 'DELETE',
    data: {
      id,
    },
  });
}
