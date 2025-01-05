import { request } from '@/utils/request';

export async function saveExcelTemplateVersion(body: { [key: string]: any }, file?: File) {
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
  return request<any>('/api/template/version/save', {
    method: 'POST',
    data: formData,
  });
}

export async function updateExcelTemplateVersion(id: string, status: number) {
  return request<any>('/api/template/version/update', {
    method: 'PUT',
    params: {
      id,
      status,
    },
  });
}

export async function getExcelTemplateVersionList(id: string | undefined) {
  return request<any>('/api/template/version/list', {
    method: 'GET',
    params: {
      type: 'excel',
      templateId: id,
    },
  });
}

export async function getExcelTemplateVersion(id: string) {
  return request<any>('/api/template/version/content', {
    method: 'GET',
    params: {
      id,
    },
  });
}

export async function deleteExcelTemplateVersion(id: string) {
  return request<any>('/api/template/version/delete', {
    method: 'DELETE',
    params: {
      id,
    },
  });
}

export async function applyExcelTemplateVersion(id: string) {
  return request<any>('/api/template/version/apply', {
    method: 'POST',
    data: {
      templateId: id,
      type: 'excel',
    },
  });
}
