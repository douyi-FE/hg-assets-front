import Swal from 'sweetalert2';
import { store } from '../store';
import { getRangeValue } from './commonFunctions';
import { handleRangeValue } from './handleBindingPaths';

// 设置字段行对象
let settingFieldRows: any[] = [];
export function setFieldsModel(bindingPaths: any) {
  Swal.fire({
    title: "<div style='font-size: 16px; text-align: left;'>设置填报字段</div>",
    position: 'top',
    width: 540,
    draggable: true,
    html: `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <button id="addRowBtn">新增字段</button>
        </div>
        <div class="tableContainer">
          <table id="fieldTable">
            <thead>
                <tr>
                <th>字段名</th>
                <th>字段引用范围</th>
                <th style="text-align: center">操作</th>
                </tr>
            </thead>
            <tbody id="tableBody">
                <!-- 动态生成的表格内容 -->
            </tbody>
          </table>
        </div>
      `,
    showCancelButton: true,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    confirmButtonColor: '#3085d6',
    backdrop: false, // 去除遮罩层
    allowOutsideClick: true, // 允许点击弹窗外区域
    preConfirm: () => {
      // 先判断重复
      const fieldNames = {};
      let maxCount = 0;
      settingFieldRows.forEach((row) => {
        if (!fieldNames[row.fieldNameInput.value]) {
          fieldNames[row.fieldNameInput.value] = 1;
        } else {
          fieldNames[row.fieldNameInput.value]++;
        }
        if (fieldNames[row.fieldNameInput.value] > maxCount) {
          maxCount = fieldNames[row.fieldNameInput.value];
        }
      });
      if (maxCount > 1) {
        // 红色边框高亮重复字段名称，并提示
        settingFieldRows.forEach((row) => {
          if (fieldNames[row.fieldNameInput.value] > 1) {
            row.fieldNameInput.style.border = '1px solid red';
          }
        });
        // 禁止关闭弹窗
        return false;
      }
      const result: any[] = [];
      settingFieldRows.forEach((row) => {
        const fieldName = row.fieldNameInput.value;
        const formulaBar = row.formulaBar;
        result.push({ fieldName, refRange: formulaBar.text() });
      });
      return result;
    },
    willOpen: () => {
      const addRowBtn = document.getElementById('addRowBtn');
      const tableBody = document.getElementById('tableBody');

      // 根据 bindingPaths 创建初始化数据
      const initData: any[] = [];
      Object.keys(bindingPaths).forEach((key) => {
        if (key === 'table') {
          return;
        }
        initData.push({
          fieldName: key,
          refRange: bindingPaths[key].rangeText,
        });
      });
      // 根据 bindingPaths 初始化表格
      initData.forEach((data) => addTableRow(tableBody, data));
      (addRowBtn as any).addEventListener('click', () => {
        addTableRow(tableBody, { fieldName: '', refRange: '' });
      });
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // 回写到 bindingPaths
      if (result.value.length > 0) {
        result.value.forEach((data) => {
          if (data.fieldName === 'table') {
            return;
          }
          const refRange = data.refRange;
          const fieldName = data.fieldName;
          const ranges = store.formulaToRanges(
            (store.spread as any).getActiveSheet(),
            refRange,
            0,
            0,
          );
          const range = getRangeValue(ranges, fieldName);
          handleRangeValue(range, fieldName, refRange);
        });
        settingFieldRows = [];
      }
    }
  });
}

function addTableRow(tableBody, data) {
  const row = document.createElement('tr');

  const fieldNameCell = document.createElement('td');
  fieldNameCell.className = 'td';
  const fieldNameInput = document.createElement('input');
  fieldNameInput.name = 'fieldName';
  fieldNameInput.type = 'text';
  fieldNameInput.maxLength = 20;
  fieldNameInput.value = data.fieldName;
  fieldNameCell.appendChild(fieldNameInput);

  const refRangeCell = document.createElement('td');
  refRangeCell.className = 'td';
  const refRangeInput: any = document.createElement('div');
  refRangeInput.name = 'refRange';
  refRangeInput.style.width = '250px';
  refRangeInput.style.height = '26px';
  refRangeInput.style.border = '1px solid #ccc';
  refRangeInput.style.borderRadius = '4px';
  refRangeInput.style.padding = '5px';
  refRangeCell.appendChild(refRangeInput);

  const actionCell = document.createElement('td');
  actionCell.className = 'td';
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = '删除';
  actionCell.appendChild(deleteBtn);

  row.appendChild(fieldNameCell);
  row.appendChild(refRangeCell);
  row.appendChild(actionCell);
  tableBody.appendChild(row);
  const formulaBar = new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(refRangeInput, {
    rangeSelectMode: true,
  });
  formulaBar.workbook(store.spread as any);
  formulaBar.text(data.refRange);
  deleteBtn.addEventListener('click', () => {
    settingFieldRows.forEach((fieldRow, index) => {
      if (fieldRow.fieldNameInput.value === fieldNameInput.value) {
        formulaBar.destroy();
        settingFieldRows.splice(index, 1);
        handleRangeValue(null, fieldRow.fieldNameInput.value, fieldRow.formulaBar.text());
        store.setBindingPaths({
          ...store.bindingPaths,
          [fieldRow.fieldNameInput.value]: undefined,
        });
      }
    });
    row.remove();
  });
  settingFieldRows.push({
    fieldNameInput,
    formulaBar,
  });
}
