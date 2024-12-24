import { request } from '@/utils/request';

export async function getInvoiceList(params: any) {
  return request<LabelValueOptions>({
    url: '/invoce/list',
    method: 'GET',
    params,
  });
}
