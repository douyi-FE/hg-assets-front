import { request, type RequestOptions } from '@/utils/request';

/** 上传 POST /api/filestorage/upload */
export async function uploadFileStorage(
  body: API.FileUploadDto,
  file?: File,
  options?: RequestOptions,
) {
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

  return request<any>('/api/filestorage/upload', {
    method: 'POST',
    data: formData,
    requestType: 'form',
    ...(options || {}),
  });
}

/** 删除 delete /api/filestorage/delete */
export async function deleteFileStorage(filePath: string, options?: RequestOptions) {
  return request<any>('/api/filestorage/delete', {
    method: 'DELETE',
    params: { path: filePath },
    ...(options || {}),
  });
}
