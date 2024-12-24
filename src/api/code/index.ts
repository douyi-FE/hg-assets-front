import { request } from '@/utils/request';

export async function getCodeProjectList(params: { project: string }) {
  return request<LabelValueOptions>({
    url: '/code/project',
    method: 'GET',
    params,
  });
}
