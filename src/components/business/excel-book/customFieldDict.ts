import { message, Modal } from 'ant-design-vue';
import Api from '@/api';
import { getApplicationByName } from '@/api/backend/api/application';
import { getTemplateFieldDict } from '@/api/backend/api/applicationData';

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

/*
  设置多列联动字典
  字典内容示例：
  模板名称	Sheet名称	主字段	主字段可选值	联动字段	联动可选值
  静设备-工程量计算书	静设备	设备大类	大类1	物料编码	aaa
  静设备-工程量计算书	静设备	设备大类	大类1	基础标高	10
  静设备-工程量计算书	静设备	设备大类	大类2	物料编码	bbb
  静设备-工程量计算书	静设备	设备大类	大类2	基础标高	20
  静设备-工程量计算书	静设备	设备大类	大类3	物料编码	ccc
  静设备-工程量计算书	静设备	设备大类	大类3	基础标高	30

  预处理 dictData 数据， 结果如下：
  const dictData = {
    'Sheet名称': [
        {
          '主字段': '设备大类',
          '主字段可选值': [
            {
              '值': '大类1',
              '关联字段': ['物料编码', '基础标高'],
              '关联值': ['aaa', '10'],
            },
            {
              '值': '大类2',
              '关联字段': ['物料编码', '基础标高'],
              '关联值': ['bbb', '20'],
            },
            {
              '值': '大类3',
              '关联字段': ['物料编码', '基础标高'],
              '关联值': ['ccc', '30'],
            },
          ]
        }
      ]
    }
*/
export const setMultiFieldDict = function (spread: any, dictData: any, dictDataFields: any) {
  // 预处理 dictData 数据
  if (!dictData || dictData.length === 0 || Object.keys(dictData).length === 0) {
    return;
  }
  spread.suspendPaint();
  const sheetDictData = {};
  // 在这里实现 dictData 数据预处理
  if (dictData && dictData.length > 0) {
    // 按Sheet名称和主字段分组处理数据
    const groupedData = {};

    dictData.forEach((item) => {
      const sheetName = item['Sheet名称'];
      const mainField = item['主字段'];
      const mainValue = item['主字段可选值'];
      const linkField = item['联动字段'];
      const linkValue = item['联动可选值'];

      if (!groupedData[sheetName]) {
        groupedData[sheetName] = {};
        sheetDictData[sheetName] = [];
        dictDataFields.value[sheetName] = [];
      }

      if (!groupedData[sheetName][mainField]) {
        groupedData[sheetName][mainField] = {};
        dictDataFields.value[sheetName].push(mainField);
      }

      // 如果主字段值不存在，创建新的主字段值对象
      if (!groupedData[sheetName][mainField][mainValue]) {
        groupedData[sheetName][mainField][mainValue] = {
          值: mainValue,
          关联字段: [],
          关联值: [],
        };
      }

      // 添加关联字段和关联值
      const mainValueObj = groupedData[sheetName][mainField][mainValue];
      if (!mainValueObj['关联字段'].includes(linkField)) {
        mainValueObj['关联字段'].push(linkField);
        mainValueObj['关联值'].push(linkValue);
      }
    });

    // 将分组后的数据转换为最终格式
    Object.keys(groupedData).forEach((sheetName) => {
      Object.keys(groupedData[sheetName]).forEach((mainField) => {
        const mainFieldData = {
          主字段: mainField,
          主字段可选值: Object.values(groupedData[sheetName][mainField]),
        };
        sheetDictData[sheetName].push(mainFieldData);
      });
    });
  }
  const sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    const sheet = spread.getSheet(i);
    const table = sheet.tables.all()[0];
    const tableRange = table.dataRange();
    const colCount = tableRange.colCount;
    const col = tableRange.col;
    const row = tableRange.row;
    const rowCount = tableRange.rowCount;
    for (let j = 0; j < colCount; j++) {
      const tableCol = table.getColumnDataField(j);
      if (sheetDictData[sheet.name()]) {
        // 判断sheetDict 中是否包含 '主字段' 等于 tableCol 的
        const mainFieldData = sheetDictData[sheet.name()].find(
          (item) => item['主字段'] === tableCol,
        );
        if (mainFieldData) {
          const colValues = mainFieldData['主字段可选值'].map((item) => item['值']);
          const dictValidator = new GC.Spread.Sheets.DataValidation.createListValidator(
            colValues.join(','),
          );
          dictValidator.highlightStyle({
            type: GC.Spread.Sheets.DataValidation.HighlightType.icon,
            color: 'gold',
            position: GC.Spread.Sheets.DataValidation.HighlightPosition.topRight,
          });
          sheet.setDataValidator(-1, col + j, dictValidator);
          // 把关联字段信息及可选值，放到列 tag 中
          sheet.setTag(-1, col + j, mainFieldData['主字段可选值']);
        }
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
    setMultiFieldDictEvents(sheet);
  }
  spread.resumePaint();
};

export const addMultiFieldDictBatch = function (spread: any, fileName: string) {
  const sheet = spread.getActiveSheet();
  const sheetName = sheet.name();
  const table = sheet.tables.all()[0];
  const { row, rowCount, colCount } = table.dataRange();
  const selections = sheet.getSelections()[0] || {};
  const data: any[] = [];
  if (selections.rowCount === 1 && selections.colCount === 1) {
    const { row: activeRow, col: activeCol } = selections;
    const mainFieldValue = sheet.getValue(activeRow, activeCol);
    const mainFieldColName = table.getColumnDataField(activeCol);
    if (
      mainFieldValue === undefined ||
      mainFieldValue === null ||
      mainFieldValue.toString().trim() === ''
    ) {
      message.error('请选择一个非空单元格');
      return;
    }
    for (let i = activeRow; i < row + rowCount; i++) {
      const mainField = sheet.getValue(i, activeCol);
      if (
        mainField === undefined ||
        mainField === null ||
        mainField.toString().trim() === '' ||
        data.find((item) => item['主字段可选值'] === mainField)
      ) {
        continue;
      }
      for (let j = 0; j < colCount; j++) {
        if (j === activeCol) {
          continue;
        }
        const relationField = sheet.getValue(i, j);
        if (
          relationField === undefined ||
          relationField === null ||
          relationField.toString().trim() === ''
        ) {
          continue;
        }
        data.push({
          模板名称: fileName,
          Sheet名称: sheetName,
          主字段: mainFieldColName,
          主字段可选值: mainField,
          联动字段: table.getColumnDataField(j),
          联动可选值: sheet.getValue(i, j),
        });
      }
    }
  }
  return data;
};

function setMultiFieldDictEvents(sheet: any) {
  sheet.bind(GC.Spread.Sheets.Events.ValueChanged, function (e, info) {
    const row = info.row;
    const col = info.col;
    const val = info.newValue;
    const sheet = info.sheet;
    const tag = sheet.getTag(-1, col);
    if (tag) {
      const table = sheet.tables.all()[0];
      if (table) {
        const tableRange = table.dataRange();
        const colCount = tableRange.colCount;
        const startCol = tableRange.col;
        const mainFieldData = tag.find((item) => item['值'] === val);
        if (mainFieldData) {
          const linkField = mainFieldData['关联字段'];
          const linkValue = mainFieldData['关联值'];
          for (let tcol = 0; tcol < colCount; tcol++) {
            const tableCol = table.getColumnDataField(tcol);
            if (linkField.includes(tableCol)) {
              const linkIndex = linkField.indexOf(tableCol);
              const linkVal = linkValue[linkIndex];
              sheet.setValue(row, startCol + tcol, linkVal);
            }
          }
        }
      }
    }
  });
  sheet.bind(GC.Spread.Sheets.Events.DragFillBlockCompleted, function (e, info) {
    const fillRange = info.fillRange;
    const fillDirection = info.fillDirection;
    const sheet = info.sheet;
    const table = sheet.tables.all()[0];
    const down = GC.Spread.Sheets.Fill.FillDirection.down;
    const up = GC.Spread.Sheets.Fill.FillDirection.up;
    if (table && (fillDirection === down || fillDirection === up)) {
      const row = fillRange.row;
      const col = fillRange.col;
      const rowCount = fillRange.rowCount;
      const colCount = fillRange.colCount;
      for (let c = col; c < col + colCount; c++) {
        const tag = sheet.getTag(-1, c);
        if (tag) {
          const dataRange = table.dataRange();
          const startCol = dataRange.col;
          // const trow = dataRange.row;
          const tcolCount = dataRange.colCount;
          // const trowCount = dataRange.rowCount;
          for (let r = row; r < row + rowCount; r++) {
            if (!dataRange.contains(r, c)) continue;
            const val = sheet.getValue(r, c);
            const mainFieldData = tag.find((item) => item['值'] === val);
            if (mainFieldData) {
              const linkField = mainFieldData['关联字段'];
              const linkValue = mainFieldData['关联值'];
              for (let tcol = 0; tcol < tcolCount; tcol++) {
                const tableCol = table.getColumnDataField(tcol);
                if (linkField.includes(tableCol)) {
                  const linkIndex = linkField.indexOf(tableCol);
                  const linkVal = linkValue[linkIndex];
                  sheet.setValue(r, startCol + tcol, linkVal);
                }
              }
            }
          }
        }
      }
    }
  });
}
