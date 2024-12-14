import { request } from '@/utils/request';

export async function getProjectList(params: { project: string }) {
  return request<LabelValueOptions>({
    url: '/project/list',
    method: 'GET',
    params,
  });
}
