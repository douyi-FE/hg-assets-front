import { http, HttpResponse, delay } from 'msw';
import { getQuery, resultSuccess, serverApi } from '../_util';

const projectCodes = [
  {
    projectNature: 'G-新建项目',
    companyAttribute: '01-中海油',
    contractYear: '2023',
    location: '0531',
    serialNumber: '001',
    example: 'G-0120030531001',
  },
  {
    projectNature: 'J-技改项目',
    companyAttribute: '02-中石化',
    contractYear: '2024',
    location: '0543',
    serialNumber: '002',
    example: 'J-0120030531001',
  },
  {
    projectNature: 'K-科技开发',
    companyAttribute: '03-中石油',
    contractYear: '',
    location: '',
    serialNumber: '',
    example: '',
  },
  {
    projectNature: 'S-设备更新',
    companyAttribute: '04-万华化学',
    contractYear: '',
    location: '',
    serialNumber: '',
    example: '',
  },
  {
    projectNature: '',
    companyAttribute: '05-滨化集团',
    contractYear: '',
    location: '',
    serialNumber: '',
    example: '',
  },
];

const deviceCodes = [
  { name: '化工装置', code: '01' },
  { name: '采油装置', code: '02' },
  { name: '煤化工装置', code: '03' },
  { name: '公辅工程', code: '04' },
  { name: '储运工程', code: '05' },
  { name: '外线线路', code: '06' },
  { name: '高压配电', code: '07' },
  { name: '房建-办公楼', code: '08' },
  { name: '房建-住宅楼', code: '09' },
  { name: '房建-绿化', code: '10' },
  { name: '房建-其它1', code: '11' },
  { name: '房建-其它2', code: '12' },
  { name: '房建-其它3', code: '13' },
  { name: '电力-1', code: '14' },
  { name: '电力-2', code: '15' },
  { name: '电力-3', code: '16' },
  { name: '电力-4', code: '17' },
];
const professionalCodes = [
  { name: '动设备', code: '01' },
  { name: '静设备', code: '02' },
  { name: '采油专用设备', code: '03' },
  { name: '煤化工专用设备', code: '04' },
  { name: '其它专用设备', code: '05' },
  { name: '管道', code: '06' },
  { name: '钢结构', code: '07' },
  { name: '电气', code: '08' },
  { name: '仪表', code: '09' },
  { name: '防腐保温', code: '10' },
  { name: '防腐保冷', code: '11' },
  { name: '土建工程', code: '12' },
  { name: '装饰工程', code: '13' },
  { name: '园林工程', code: '14' },
];

export default [
  http.get(serverApi('/code/project'), async ({ request }) => {
    await delay(500);
    const { project = 'project' } = getQuery(request);
    const result = {
      project: projectCodes,
      device: deviceCodes,
      professional: professionalCodes,
    }[project];
    return HttpResponse.json(resultSuccess(result));
  }),
];
