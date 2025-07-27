import Api from '@/api';
import { getApplicationByName } from '@/api/backend/api/application';
import { getTemplateFieldDict } from '@/api/backend/api/applicationData';
import { message, Modal } from 'ant-design-vue';

const TEMPLATE_FIELD_DICT_NAME = '列表字段取值字典';
/*
  先预处理 dictData 数据， 结果如下：
  {
    'Sheet名称': {
      '字段名称': {
        '字典值': ['字典名称1', '字典名称2', '字典名称3']
      }
    }
  }
*/
export const setFieldDict = function (spread: any, dictData: any, dictDataFields: any) {
  // 预处理 dictData 数据
  if (!dictData || dictData.length === 0) {
    return;
  }
  spread.suspendPaint();
  const sheetDictData = {};
  if (dictData && dictData.length > 0) {
    dictData.forEach((item) => {
      if (!sheetDictData[item['Sheet名称']]) {
        sheetDictData[item['Sheet名称']] = {};
        dictDataFields.value[item['Sheet名称']] = [];
      }
      if (!sheetDictData[item['Sheet名称']][item['字段名称']]) {
        sheetDictData[item['Sheet名称']][item['字段名称']] = [];
        dictDataFields.value[item['Sheet名称']].push(item['字段名称']);
      }
      sheetDictData[item['Sheet名称']][item['字段名称']].push(item['可选值']);
    });
  }
  const sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    const table = sheet.tables.all()[0];
    const tableRange = table.dataRange();
    const colCount = tableRange.colCount;
    const col = tableRange.col;
    const rowCount = tableRange.rowCount;
    const row = tableRange.row;
    for (let j = 0; j < colCount; j++) {
      const tableCol = table.getColumnDataField(j);
      if (sheetDictData[sheet.name()] && sheetDictData[sheet.name()][tableCol]) {
        const colValues = sheetDictData[sheet.name()][tableCol];
        // 更换为list validator
        const dictValidator = new GC.Spread.Sheets.DataValidation.createListValidator(
          colValues.join(','),
        );
        dictValidator.highlightStyle({
          type: GC.Spread.Sheets.DataValidation.HighlightType.icon,
          color: 'gold',
          position: GC.Spread.Sheets.DataValidation.HighlightPosition.topRight,
        });
        sheet.setDataValidator(-1, col + j, dictValidator);
      }
    }
    // 清除表格外单元格的校验
    const sheetRowCount = sheet.getRowCount();
    for (let r = 0; r < sheetRowCount; r++) {
      if (r >= row && r < row + rowCount) {
        continue;
      }
      sheet.setDataValidator(r, -1, null);
    }
  }
  spread.resumePaint();
};

export const updateDict = async function (spread: any, dictDataFields: any, fileName: string) {
  const dictData: any[] = [];
  // 先校验出几个字段中不在字典的值
  const sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    if (!dictDataFields.value[sheet.name()]) {
      continue;
    }
    const fields = dictDataFields.value[sheet.name()];
    const table = sheet.tables.all()[0];
    const tableRange = table.dataRange();
    const colCount = tableRange.colCount;
    const col = tableRange.col;
    const rowCount = tableRange.rowCount;
    const row = tableRange.row;
    for (let j = 0; j < colCount; j++) {
      const tableCol = table.getColumnDataField(j);
      if (!fields.includes(tableCol)) {
        continue;
      }
      for (let r = row; r < row + rowCount; r++) {
        const value = sheet.getValue(r, col + j);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          continue;
        }
        const isValid = sheet.isValid(r, col + j, value);
        if (!isValid) {
          // 排除重复值
          const isExist = dictData.some((item) => item.可选值 === value);
          if (isExist) {
            continue;
          }
          dictData.push({
            模板名称: fileName,
            Sheet名称: sheet.name(),
            字段名称: tableCol,
            可选值: value,
          });
        }
      }
    }
  }
  if (dictData.length > 0) {
    await Modal.confirm({
      title: '提示',
      content: '把当前列中所有值添加到字典中，此操作会在所有同类表格中生效，是否继续？',
      onOk: async () => {
        // 更新到字典
        const dictApp = await getApplicationByName(TEMPLATE_FIELD_DICT_NAME);
        const templateFieldDictId = dictApp.templateId;
        const initDataSource = dictApp.initDataSource;
        const dictTableData = initDataSource['列表字段取值字典'];
        const dictBindingPath = Object.keys(dictTableData).find((key) => key.startsWith('table'));

        const res = await Api.applicationData.appendApplicationData({
          templateId: templateFieldDictId,
          applicationData: { 列表字段取值字典: { [dictBindingPath!]: dictData } },
        });
        if (res.code === 200) {
          message.success('更新字典成功');
          // 重新加载当前表格，只需要刷新字典即可，其他数据不变
          const dictData = await getTemplateFieldDict({
            templateId: templateFieldDictId,
            dictName: fileName,
          });
          setFieldDict(spread, dictData, dictDataFields);
        } else {
          message.error('更新字典失败');
        }
      },
    });
  } else {
    message.success('没有检索到可更新的字典值');
  }
};

// 把选中单元格数据添加到字典
export const addFieldDict = async function (spread: any, dictDataFields: any, fileName: string) {
  // 提醒用户是否继续
  await Modal.confirm({
    title: '提示',
    content: '添加字典会在所有同类表格中生效，是否继续？',
    onOk: async () => {
      const dictData: any[] = [];
      const sheet = spread.getActiveSheet();
      const table = sheet.tables.all()[0];
      const tableRange = table.dataRange();
      const col = tableRange.col;
      const activeRow = sheet.getActiveRowIndex();
      const activeCol = sheet.getActiveColumnIndex();
      if (tableRange.contains(activeRow, activeCol)) {
        const value = sheet.getValue(activeRow, activeCol);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          message.warning('请选择一个有效值');
          return;
        }
        dictData.push({
          模板名称: fileName,
          Sheet名称: sheet.name(),
          字段名称: table.getColumnDataField(activeCol - col),
          可选值: value,
        });
        // 获取字典表的bindingPath
        const dictApp = await getApplicationByName(TEMPLATE_FIELD_DICT_NAME);
        const initDataSource = dictApp.initDataSource;
        const dictTableData = initDataSource['列表字段取值字典'];
        const dictBindingPath = Object.keys(dictTableData).find((key) => key.startsWith('table'));
        // 更新字典
        const templateFieldDictId = (await getApplicationByName(TEMPLATE_FIELD_DICT_NAME))
          .templateId;
        const res = await Api.applicationData.appendApplicationData({
          templateId: templateFieldDictId,
          applicationData: { 列表字段取值字典: { [dictBindingPath!]: dictData } },
        });
        if (res.code === 200) {
          message.success('添加字典成功');
          // 重新加载当前表格，只需要刷新字典即可，其他数据不变
          const dictDatas = await getTemplateFieldDict({
            templateId: templateFieldDictId,
            dictName: fileName,
          });
          setFieldDict(spread, dictDatas, dictDataFields);
        } else {
          message.error('添加字典失败');
        }
      } else {
        message.warning('请在表格中选择一个单元格');
      }
    },
  });
};
