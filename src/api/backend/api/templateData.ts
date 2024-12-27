/** 模板数据api */

import { request } from '@/utils/request';

// 模板数据列表
export async function getTemplateDataList(params: any) {
  return request<any>({
    url: '/api/template/data/list',
    method: 'GET',
    params,
  });
}

// 模板数据保存
export async function saveTemplateData(body: {
  name: string;
  code: string;
  record: { table: Array<any> };
}) {
  return request({
    url: '/api/template/data/save',
    method: 'POST',
    data: body,
  });
}
