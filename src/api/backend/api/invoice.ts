import { request, type RequestOptions } from '@/utils/request';

// 获取发票列表
export async function getInvoiceList(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/invoice/list',
    method: 'GET',
    params,
    ...(options || {}),
  });
}

// 保存发票数据
export async function saveInvoiceData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/data',
    method: 'POST',
    data: params,
  });
}

// 根据发票id更新发票数据
export async function updateInvoiceData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/application/data',
    method: 'PUT',
    data: params,
  });
}
