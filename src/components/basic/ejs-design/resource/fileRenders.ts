// 预览pdf
export async function renderPdf(id, file) {
  try {
    const reader = new FileReader();
    const container = document.getElementById(id);
    if (!container) {
      return;
    }
    container.innerHTML = '';
    reader.onload = function (e) {
      const arrayBuffer = e.target?.result as ArrayBuffer; // 转换为 ArrayBuffer
      const pdfData = new Uint8Array(arrayBuffer);

      // 使用 pdf.js 渲染 PDF
      const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
      loadingTask.promise
        .then((pdf) => {
          console.log(`PDF loaded: ${pdf.numPages} pages`);
          for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
            pdf.getPage(pageNumber).then((page) => {
              console.log('Page loaded');

              const scale = 1.5;
              const viewport = page.getViewport({ scale: scale });

              // 准备 canvas 用于渲染
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.width = viewport.width;
              canvas.height = viewport.height;
              container.appendChild(canvas);

              // 渲染 PDF 页面到 canvas
              const renderContext = {
                canvasContext: context,
                viewport: viewport,
              };
              page.render(renderContext).promise.then(() => {
                console.log('Page rendered');
              });
            });
          }
        })
        .catch((error) => {
          console.error('Error loading PDF:', error);
        });
    };

    reader.readAsArrayBuffer(file); // 读取 Blob 文件为 ArrayBuffer
  } catch (loadingError) {
    console.error('Error loading PDF:', loadingError);
  }
}

// 预览excel
export function renderExcel(id, file) {
  const container = document.getElementById(id);
  if (!container) {
    return;
  }
  container.innerHTML = '';
  // 添加一个div，用于显示excel
  const excelContainer = document.createElement('div');
  excelContainer.id = 'excelContainer';
  excelContainer.style.width = '100%';
  excelContainer.style.height = '100%';
  container.appendChild(excelContainer);
  let spread = GC.Spread.Sheets.findControl(excelContainer);
  if (!spread) {
    spread = new GC.Spread.Sheets.Workbook(excelContainer, { sheetCount: 1 });
  }
  const fileBlob = new Blob([file], { type: 'application/vnd.ms-excel' });
  spread.import(
    fileBlob,
    function () {
      console.log('open excel success');
    },
    function (e) {
      console.log('open excel failed');
    },
  );
}

// 预览图片
export function renderPic(id, file) {
  const previewContainer = document.getElementById(id);
  if (!previewContainer) {
    return;
  }
  previewContainer.innerHTML = '';
  // 使用 FileReader 读取图片内容
  const reader = new FileReader();
  reader.onload = function (e) {
    // 创建 img 元素显示预览
    const img = document.createElement('img');
    img.src = e.target?.result as string;
    img.alt = file.name;
    img.style.maxWidth = '1350px'; // 设置预览图片的最大宽度
    img.style.margin = '10px';
    previewContainer.appendChild(img);
  };
  reader.readAsDataURL(file); // 读取文件内容并以 Data URL 格式返回
}

// 预览word
export function renderWord(id, file) {
  // const file = el.files[0]
  const previewContainer = document.getElementById(id);
  if (!previewContainer) {
    return;
  }
  previewContainer.innerHTML = '';

  const options = { inWrapper: false, ignoreWidth: true, ignoreHeight: true };
  window.docx
    .renderAsync(file, previewContainer, null, options)
    .then((x) => console.log('docx: finished'));
}

// 预览未知格式，当成 text 格式预览
export function renderUnknown(id) {
  const previewContainer = document.getElementById(id);
  if (!previewContainer) {
    return;
  }
  previewContainer.innerHTML = '';
  previewContainer.innerHTML += `<p>不支持的格式</p>`;
}
