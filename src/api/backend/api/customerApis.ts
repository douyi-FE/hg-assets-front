import { request, type RequestOptions } from '@/utils/request';

export async function getSubDepts(params: any, options?: RequestOptions) {
  return request<any>({
    url: `/api/system/depts/subDepts`,
    method: 'GET',
    params,
    ...(options || {}),
  });
}
