/** 模板数据api */

import { request } from '@/utils/request';

// 模板-应用数据列表
export async function getTemplateDataList(params: any) {
  return request<any>({
    url: '/api/template/data/list',
    method: 'GET',
    params,
  });
}

// 模板-应用数据保存
export async function createTemplateData(body: {
  templateId: string;
  applicationName: string;
  templateName: string;
}) {
  return request({
    url: '/api/template/data/create',
    method: 'POST',
    data: body,
  });
}

// 模板-应用数据更新
export async function updateTemplateData(body: {
  id: string;
  templateId: string;
  applicationName: string;
  templateName: string;
}) {
  return request({
    url: '/api/template/data/update',
    method: 'POST',
    data: body,
  });
}

// 模板-应用数据删除
export async function deleteTemplateData(body: { id: string }) {
  return request({
    url: '/api/template/data/delete',
    method: 'POST',
    data: body,
  });
}

// 依据应用名查找模板-应用数据
export async function getTemplateDataByApplicationName(params: { applicationName: string }) {
  return request({
    url: '/api/template/data/application',
    method: 'GET',
    params,
  });
}
