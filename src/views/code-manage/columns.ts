const projectColumns = [
  { displayName: '项目性质', name: 'projectNature', width: 120 },
  { displayName: '集团公司属性', name: 'companyAttribute', width: 140 },
  { displayName: '合同年份', name: 'contractYear', width: 100 },
  { displayName: '所在地', name: 'location', width: 100 },
  { displayName: '流水号', name: 'serialNumber', width: 100 },
  { displayName: '示例', name: 'example', width: 130 },
];
const deviceColumns = [
  { displayName: '编码', name: 'code', width: 100 },
  { displayName: '名称', name: 'name', width: 100 },
];
const professionalColumns = [
  { displayName: '编码', name: 'code', width: 100 },
  { displayName: '名称', name: 'name', width: 100 },
];

export default {
  project: projectColumns,
  device: deviceColumns,
  professional: professionalColumns,
};
