import Swal from 'sweetalert2';
import { store } from '../store';
import { showAlert } from './commonFunctions';

// 弹出脚本对话框，用sweetalert2实现
export function addScript() {
  const sheet = (store.spread as any).getActiveSheet();
  const tag = sheet.tag();
  let script = '';
  if (tag && tag.script) {
    script = tag.script;
  }
  Swal.fire({
    title: `请输入${sheet.name()}表的脚本`,
    input: 'textarea',
    inputValue: script,
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    showCancelButton: true,
    showConfirmButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      sheet.tag({
        script: result.value,
      });
    }
  });
}

// 执行脚本
export function runScript() {
  const sheet = (store.spread as any).getActiveSheet();
  const tag = sheet.tag();
  if (!tag || !tag.script) {
    showAlert(`请先添加${sheet.name()}表的脚本`, 'warning');
    return;
  }
  eval(tag.script);
}
