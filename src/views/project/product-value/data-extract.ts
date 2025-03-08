import { cloneDeep } from 'lodash-es';

const fieldMap = {
  咨询合同号: '合同编号',
  咨询合同名称: '合同名称',
  工程项目名称: '项目名称',
  咨询单位: '合同乙方',
};

const basicKey = '合同编号';

/**
 * 从合同数据数据中提取数据到产值数据
 * @param sourceData 合同数据
 * @param targetData 产值数据
 * @returns 融合后的数据
 */
export const getExtractData = (sourceData: any, targetData: any) => {
  const extractData: any[] = cloneDeep(targetData);
  sourceData.forEach((sourceItem: any) => {
    const matchTarget: any =
      targetData.find((targetItem: any) => targetItem[basicKey] === sourceItem[basicKey]) || {};
    if (Object.keys(matchTarget).length === 0) {
      extractData.unshift(matchTarget);
    }
    Object.entries(fieldMap).forEach(([key, value]) => {
      matchTarget[key] = sourceItem[value];
    });
  });
  return extractData;
};
