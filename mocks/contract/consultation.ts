import { http, HttpResponse } from 'msw';
import { resultSuccess, serverApi } from '../_util';

const data = [
  {
    serialNumber: 1,
    contractNumber: '2021-001',
    projectName: '中复神鹰碳纤维股份有限公司航空航天高性能碳纤维及原丝试验线项目',
    contractName: '建设工程造价咨询技术服务合作协议',
    contractPartyA: '山东省纺织建筑设计院有限公司',
    contractPartyB: '弘庚咨询有限公司',
    location: '连云港',
    industry: '石油化工',
    contractAmountInTenThousands: 95000,
    isJointVenture: '否',
  },
  {
    serialNumber: 2,
    contractNumber: '2021-002',
    projectName: '海油工程珠海深水海洋工程装备制造基地二期工程项目后评价',
    contractName: '海油工程珠海深水海洋工程装备制造基地二期工程项目后评价服务合同',
    contractPartyA: '海洋石油工程（珠海）有限公司',
    contractPartyB: '弘庚咨询有限公司',
    location: '珠海',
    industry: '石油化工',
    contractAmountInTenThousands: 128000,
    isJointVenture: '否',
    partyAContactPerson: '陈超',
    partyAPhone: 18666936289,
    partyAEmail: 'chenchao18@cnooc.com.cn',
  },
  {
    serialNumber: 3,
    contractNumber: '2022-01',
    projectName: '冀交能源加气站项目',
    contractName: '冀交能源加气站项目工程造价及结算编制合同',
    contractPartyA: '中海油冀交能源销售有限公司',
    contractPartyB: '弘庚咨询有限公司',
    location: '河北',
    industry: '石油化工',
    contractAmountInTenThousands: 29400,
    partyBProjectManager: '李世轩',
  },
];

export default [
  http.get(serverApi('/contract/consultation'), async ({ request }) => {
    return HttpResponse.json(resultSuccess(data));
  }),
];
