import Swal from 'sweetalert2';
import { store } from '../store';
import { showAlert, getRangeValue, importFile } from './commonFunctions';
import { handleRangeValue } from './handleBindingPaths';

// 开始选择模式
export function startSelectMode(title, selectType) {
  // 显示弹窗并调整相关交互逻辑
  showAreaSelector(title, selectType);
}

// 添加显示选择区域对话框的函数
function showAreaSelector(title, selectType) {
  Swal.fire({
    title: `<div style='font-size: 16px; text-align: left;'>${title}</div>`,
    position: 'top',
    width: 350,
    draggable: true,
    html: `<div id="formulaBar" spellcheck="false" style="border: 1px solid #808080; width: 250px; margin: 10px auto; text-align: left;"></div>`,
    showCancelButton: true,
    cancelButtonText: '取消',
    confirmButtonText: '确定',
    confirmButtonColor: '#3085d6',
    backdrop: false, // 去除遮罩层
    allowOutsideClick: true, // 允许点击弹窗外区域
    didOpen: () => {
      // 初始化 formulaBar
      store.setFbx(
        new GC.Spread.Sheets.FormulaTextBox.FormulaTextBox(document.getElementById('formulaBar'), {
          rangeSelectMode: true,
        }),
      );
      (store.fbx as any).workbook(store.spread);
      (store.fbx as any).startSelectMode();
    },
    willClose: () => {
      (store.fbx as any).endSelectMode();
    },
  }).then((result) => {
    if (result.isConfirmed) {
      let area = (store.fbx as any).text();
      const ranges = store.formulaToRanges((store.spread as any).getActiveSheet(), area, 0, 0);
      const rangeValue = getRangeValue(ranges, selectType);
      if (rangeValue) {
        // 按类型处理
        handleRangeValue(rangeValue, selectType, area);
      }
    }
  });
}

// 清空选择
export function clearSelections(isImport = false) {
  if (isImport) {
    store.setInitDataSource({});
    store.setBindingPaths({});
  } else {
    if (!store.originalFile) {
      showAlert('未导入模板，请先导入模板', 'error');
      return;
    }
    Swal.fire({
      title: '请确认',
      text: '重置会导致所有操作被还原，是否继续？',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: '取消',
      confirmButtonText: '确定',
      confirmButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        store.setInitDataSource({});
        store.setBindingPaths({});
        importFile(store.originalFile);
      }
    });
  }
  // 复原autoSetTableColumn
  if (store.autoSetTableColumn) {
    const autoSetTableColumnCommand = GC.Spread.Sheets.Designer.getCommand('AutoSetTableColumn');
    autoSetTableColumnCommand?.execute(store.designer);
  }
}
