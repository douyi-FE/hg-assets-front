import { allTemplatesUrl, templateUrl, submitUrl } from '../config';
import { store } from '../store';
import { base64ToArrayBuffer, showAlert } from './commonFunctions';

// 初始化 SpreadJS
export function initSpread(divId) {
  const spread = new GC.Spread.Sheets.Workbook(document.getElementById(divId));
  getTemplates();
  document.getElementById('submitBtn')?.addEventListener('click', (e) => {
    submitData();
  });
  return spread;
}

// 获取所有模板
function getTemplates() {
  fetch(allTemplatesUrl)
    .then((response) => response.json())
    .then((data) => {
      data.forEach((item) => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.filename;
        document.getElementById('templateSelect')?.appendChild(option);
      });
      // 添加事件监听
      document.getElementById('templateSelect')?.addEventListener('change', (e) => {
        const id = (e.target as HTMLSelectElement).value;
        if (!id) {
          return;
        }
        fetch(templateUrl + id)
          .then((response) => response.json())

          .then((data) => {
            if (data.base64Data) {
              // 打开模板
              const arrayBuffer = base64ToArrayBuffer(data.base64Data);
              const fileBlob = new Blob([arrayBuffer], {
                type: 'application/octet-stream',
              });
              const initDataSource = JSON.parse(data.initDataSource);
              // 调用 SpreadJS 的 open 方法
              (store.spread as any).open(
                fileBlob,
                function () {
                  (store.spread as any).resumePaint();
                  (store.spread as any)
                    .getActiveSheet()
                    .setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(initDataSource));
                },
                function (e) {
                  showAlert('模板加载失败', 'error');
                },
              );
            }
          });
      });
    });
}
// 提交数据事件
function submitData() {
  const sheet = (store.spread as any).getActiveSheet();
  const id = (document.getElementById('templateSelect') as HTMLSelectElement).value;
  const submitData = sheet.getDataSource().getSource();
  fetch(submitUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id,
      submitData,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      showAlert(`提交成功: ${data.message}`, 'success');
    })
    .catch((error) => {
      showAlert(`提交失败: ${error.message}`, 'error');
    });
}
