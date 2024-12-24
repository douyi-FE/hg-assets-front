import { request } from '@/utils/request';

export async function getConsultationList(params: {}) {
  return request<LabelValueOptions>({
    url: '/contract/consultation',
    method: 'GET',
    params,
  });
}
