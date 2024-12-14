import { http, HttpResponse, delay } from 'msw';
import { getQuery, resultSuccess, serverApi } from '../_util';

const getProjectList = function (project: string = '') {
  return {
    name: project,
    list: [
      {
        city: '龙口',
        createdAt: '2024-09-06 08:51:40',
        id: 'f065e797e08c40829ba9dae80164a6be',
        modifyAt: '2024-09-06 16:48:13',
        name: '龙口南山LNG码头一期工程竣工决算报告编制',
        owner: '国家管网集团南山（山东）天然气有限公司',
        province: '山东省',
      },
      {
        city: '滨州市',
        createdAt: '2024-12-13 14:48:15',
        id: 'eb25a8f9d3bc43e388575f53765027da',
        modifyAt: '2024-12-13 14:48:15',
        name: '精密分馏装置分馏系统优化改造',
        owner: '中海沥青股份有限公司',
        province: '山东省',
      },
      {
        charger: '李四',
        city: '滨州市',
        contractor: '弘庚咨询有限公司',
        createdAt: '2024-07-04 13:40:59',
        id: 'e407ffab9d0c466b87542de0ed27e09d',
        modifyAt: '2024-09-29 16:57:20',
        name: '30万吨特种油原料加氢项目',
        owner: '中海沥青股份有限公司',
        province: '山东省',
      },
      {
        city: '龙口',
        createdAt: '2024-09-06 16:50:19',
        id: 'd4d6ca83baee41abacc9ad4dc6200e30',
        modifyAt: '2024-09-06 16:51:17',
        name: '龙口南山LNG接收站一期工程竣工决算报告编制',
        owner: '国家管网集团南山（山东）天然气有限公司',
        province: '山东省',
      },
      {
        charger: '张三',
        city: '珠海市',
        createdAt: '2024-06-29 14:50:59',
        id: 'c9e603523ff7470d8ec70a7be71a6b50',
        modifyAt: '2024-09-29 16:58:55',
        name: '测试工程',
        owner: '珠海海洋石油工程',
        province: '广东省',
      },
    ],
  };
};

export default [
  http.get(serverApi('/project/list'), async ({ request }) => {
    await delay(1800);
    const { project } = getQuery(request);
    return HttpResponse.json(resultSuccess(getProjectList(project)));
  }),
];
