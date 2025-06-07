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
        // 设置下拉框
        // const comboItems = colValues.map((item) => ({ text: item, value: item }));
        // const combo = new GC.Spread.Sheets.CellTypes.ComboBox();
        // combo.items(comboItems).editorValueType(GC.Spread.Sheets.CellTypes.EditorValueType.text);
        // sheet.setCellType(-1, col + j, combo);
        // 更换为list validator
        const dictValidator = new GC.Spread.Sheets.DataValidation.createListValidator(colValues.join(','));
        // dictValidator.inputTitle("请选择");
        // dictValidator.inputMessage(colValues.join(','));
        dictValidator.highlightStyle({
          type: GC.Spread.Sheets.DataValidation.HighlightType.icon,
          color: "gold",
          position: GC.Spread.Sheets.DataValidation.HighlightPosition.topRight
        });
        sheet.setDataValidator(-1, col + j, dictValidator);
      }
    }
    const sheetRowCount = sheet.getRowCount();
    // const rowCellType = new TemplateCellType();
    for (let r = 0; r < sheetRowCount; r++) {
      if (r >= row && r < row + rowCount) {
        continue;
      }
      // sheet.setCellType(r, -1, rowCellType);
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
          dictData.push({
            '模板名称': fileName,
            Sheet名称: sheet.name(),
            '字段名称': tableCol,
            '可选值': value
          });
        }
      }
    }
  }
  console.log(dictData);
  if (dictData.length > 0) {
    // 提醒用户，更新字典会重置页面，未保存数据将丢失，是否继续
    await Modal.confirm({
      title: '提示',
      content: '更新字典会重置页面，未保存数据将丢失，是否继续',
      onOk: async () => {
        // 更新到字典
        const templateFieldDictId = (await getApplicationByName(TEMPLATE_FIELD_DICT_NAME)).templateId;
        const res = await Api.applicationData.appendApplicationData({
          templateId: templateFieldDictId,
          applicationData: { '列表字段取值字典': dictData }
        });
        if (res.code === 200) {
          message.success('更新字典成功');
          // 重新加载当前表格，只需要刷新字典即可，其他数据不变
          const dictData = await getTemplateFieldDict({ templateId: templateFieldDictId, dictName: fileName });
          setFieldDict(spread, dictData, dictDataFields);
        } else {
          message.error('更新字典失败');
        }
      }
    });

  } else {
    message.success('没有检索到可更新的字典值');
  }
};

// 把选中单元格数据添加到字典
export const addFieldDict = async function (spread: any, dictDataFields: any, fileName: string) {
  const dictData: any[] = [];
  const sheet = spread.getActiveSheet();
  const table = sheet.tables.all()[0];
  const tableRange = table.dataRange();
  const col = tableRange.col;
  const activeRow = sheet.getActiveRowIndex();
  const activeCol = sheet.getActiveColumnIndex();
  if (tableRange.contains(activeRow, activeCol)) {
    const validator = sheet.getDataValidator(activeRow, activeCol);
    if (validator) {
      message.warning('该单元格已设置字典，请点击【更新字典】按钮更新字典');
      return;
    }
    const value = sheet.getValue(activeRow, activeCol);
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      message.warning('请选择一个有效值');
      return;
    }
    dictData.push({
      '模板名称': fileName,
      Sheet名称: sheet.name(),
      '字段名称': table.getColumnDataField(activeCol - col),
      '可选值': value
    });
    // 更新字典
    const templateFieldDictId = (await getApplicationByName(TEMPLATE_FIELD_DICT_NAME)).templateId;
    const res = await Api.applicationData.appendApplicationData({
      templateId: templateFieldDictId,
      applicationData: { '列表字段取值字典': dictData }
    });
    if (res.code === 200) {
      message.success('添加字典成功');
      // 重新加载当前表格，只需要刷新字典即可，其他数据不变
      const dictDatas = await getTemplateFieldDict({ templateId: templateFieldDictId, dictName: fileName });
      setFieldDict(spread, dictDatas, dictDataFields);
    } else {
      message.error('添加字典失败');
    }
  } else {
    message.warning('请在表格中选择一个单元格');
  }
};