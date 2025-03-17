/** 模板附件api */

import { request } from '@/utils/request';

// 模板附件上传
export async function upload(params: any) {
  return request<any>('/api/template/attach/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

// 模板附件下载
export async function download(params: any) {
  return request<any>({
    url: '/api/template/attach/download',
    method: 'GET',
    params,
  });
}

// 模板附件删除
export async function deleteFile(params: any) {
  return request<any>({
    url: '/api/template/attach/delete',
    method: 'POST',
    params,
  });
}

// 模板附件列表
export async function findByFileId(params: any) {
  return request<any>({
    url: '/api/template/attach/findByFileId',
    method: 'GET',
    params,
  });
}

// 下载文件包
export async function downloadZip(params: any) {
  return request<any>({
    url: '/api/template/attach/downloadZip',
    method: 'GET',
    params,
  });
}

// 查询文件列表
export async function findByFileIds(params: any) {
  return request<any>({
    url: '/api/template/attach/findByFileIds',
    method: 'GET',
    params,
  });
}
