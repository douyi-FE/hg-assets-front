/** 模板管理api */

import { request, type RequestOptions } from '@/utils/request';

// excel相关

export async function getExcelTemplateList(params: any) {
  return request<any>({
    url: '/api/template/list',
    method: 'GET',
    params,
  });
}

export async function getExcelTemplateEjs(id: string) {
  return request<any>({
    url: '/api/template/excel/ejs',
    method: 'GET',
    params: {
      id,
    },
  });
}

export async function saveExcelTemplate(body: any, file?: File, options?: RequestOptions) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });
  return request<any>('/api/template/excel/save', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  });
}

export async function updateExcelTemplate(body: any, file?: File, options?: RequestOptions) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });
  return request<any>('/api/template/excel/update', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  });
}

export async function deleteExcelTemplate(id: string) {
  return request<any>('/api/template/excel', {
    method: 'DELETE',
    params: {
      id,
    },
  });
}
// word相关

export const getWordTemplateList = async function (params: object) {
  return request<any>('/api/template/word/list', {
    method: 'GET',
    params,
  });
};

export const saveWordTemplate = async function (body: any, file?: File) {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }
  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === 'object' && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ''));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });
  return request<any>('/api/template/word/save', {
    method: 'POST',
    data: formData,
  });
};

export const downloadWordTemplate = function (params) {
  return request<any>('/api/template/word/download', {
    method: 'GET',
    params,
  });
};

export const deleteWordTemplate = function (params) {
  return request<any>('/api/template/word/delete', {
    method: 'DELETE',
    params,
  });
};
