import { request, type RequestOptions } from '@/utils/request';

export async function getUserList() {
  return request<LabelValueOptions>({
    url: '/api/users/list',
    method: 'GET',
  });
}

export async function saveUser(body: any = {}, file?: File, options?: RequestOptions) {
  const formData = new FormData();
  if (file) {
    formData.append('sjs', file);
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
  return request<any>('/api/users/save', {
    method: 'POST',
    data: formData,
    ...(options || {}),
  });
}
