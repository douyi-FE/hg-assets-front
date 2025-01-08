/** 产指表api */

import { request } from '@/utils/request';

export async function createOutputValueReport(params: any) {
  return request<any>({
    url: '/api/outputvalue/report',
    method: 'POST',
    data: params,
    headers: {
      responseType: 'blob', // 改为 blob
    },
  });
}
