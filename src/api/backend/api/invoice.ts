import { request, type RequestOptions } from '@/utils/request';

// 获取发票列表
export async function getInvoiceList(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/invoice/list',
    method: 'GET',
    params,
    ...(options || {}),
  }).then((res) => {
    const data = res.map((item: any) => ({
      ...item,
      ...item.data,
    }));
    console.log('data', data);
    return data;
  });
}

// 保存发票数据
export async function saveInvoiceData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/invoice/data',
    method: 'POST',
    data: params,
  });
}

// 根据发票id更新发票数据
export async function updateInvoiceData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/invoice/data',
    method: 'PUT',
    data: params,
  });
}

// 根据发票code删除发票数据
export async function deleteInvoiceData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/invoice/data',
    method: 'DELETE',
    data: params,
  });
}

// 根据发票code提交发票数据
export async function submitInvoiceData(params: any, options?: RequestOptions) {
  return request<any>({
    url: '/api/invoice/apply',
    method: 'POST',
    data: params,
  });
}
