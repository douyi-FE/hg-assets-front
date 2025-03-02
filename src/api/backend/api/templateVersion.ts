import { request } from '@/utils/request';

export async function saveExcelTemplateVersion(data: any) {
  return request<any>('/api/template/version/save', {
    method: 'POST',
    data: data,
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
