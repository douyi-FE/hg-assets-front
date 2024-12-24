import { http, HttpResponse } from 'msw';
import { resultSuccess, serverApi } from '../_util';

const list = [
  {
    Id: 'c1cf0840-66c5-4a24-aa08-b23f00f03cc0',
    name: '人员信息',
    code: 'user-info-template',
    type: 'excel',
    // 0-草稿；1-待发布；2-已发布
    status: 0,
    createDate: '2024-12-09',
    updateDate: '2024-12-19',
    templateId: 'f0840-66c5-4a24-aa08-b23f00',
    note: '这是人员信息模板',
  },
  {
    Id: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    name: '咨询合同台帐',
    code: 'device-info-template',
    type: 'excel',
    status: 1,
    createDate: '2024-11-05',
    updateDate: '2024-11-15',
    templateId: 'e5f6-7a8b-9c0d-1e2f3a4b5c6d',
    note: '这是咨询合同台帐模板',
  },
  {
    Id: 'f9e8d7c6-b5a4-3210-9876-543210fedcba',
    name: '对外-合同台帐',
    code: 'project-info-template',
    type: 'word',
    status: 2,
    createDate: '2024-10-01',
    updateDate: '2024-10-11',
    templateId: 'b5a4-3210-9876-543210fedcba',
    note: '这是对外-合同台帐模板',
  },
];

export default [
  http.get(serverApi('/template/excel'), async ({ request }) => {
    // await delay(500);
    return HttpResponse.json(resultSuccess(list));
  }),
];
