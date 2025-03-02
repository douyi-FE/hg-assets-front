import { store } from '../store';
import { promptModal, showAlert } from './commonFunctions';
export class RenderHTMLTagCellType extends GC.Spread.Sheets.CellTypes.Text {
  typeName: string;
  allowOverflow: boolean;

  constructor(items?: any, size?: any, isHorizontal?: boolean) {
    super();
    this.typeName = 'RenderHTMLTagCellType';
    this.allowOverflow = false;
  }
}

RenderHTMLTagCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
  // 自定义单元格什么都不用做，只需要隐藏value即可。
  return GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [
    ctx,
    ' ',
    x,
    y,
    w,
    h,
    style,
    context,
  ]);
};

const svgPattern =
  '<svg xmlns="http://www.w3.org/2000/svg" width="{0}" height="{1}">' +
  '<foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml" style="font:{2}">{3}</div></foreignObject></svg>';

function _html2img(value, cell) {
  const w = cell.sheet.getCellRect(cell.row, cell.col).width;
  const h = cell.sheet.getCellRect(cell.row, cell.col).height;
  const style = cell.sheet.getActualStyle(cell.row, cell.col);
  let data = svgPattern
    .replace('{0}', w)
    .replace('{1}', h)
    .replace('{2}', style.font)
    .replace('{3}', value);
  const doc = document.implementation.createHTMLDocument('');
  doc.write(data);
  // Get well-formed markup
  data = new XMLSerializer().serializeToString(doc.body.children[0]);

  const img = new Image();
  img.src = 'data:image/svg+xml;base64,' + window.btoa(unescape(encodeURIComponent(data))); // 涉及中文时的转码
  cell.tag(img);
  img.onload = (function (cell, value, img) {
    return () => {
      cell.cellType(new RenderHTMLTagCellType());
      cell.value(value);
      cell.backgroundImageLayout(GC.Spread.Sheets.ImageLayout.center);
      cell.backgroundImage(img.src);
    };
  })(cell, value, img);
}

export function testHtmlCell() {
  (store.spread as any).options.backgroundImageLayout = GC.Spread.Sheets.ImageLayout.center;

  const sheet = (store.spread as any).getActiveSheet();
  sheet.setRowHeight(10, 320);
  sheet.setColumnWidth(10, 400);
  sheet.setRowHeight(12, 200);
  sheet.setColumnWidth(12, 300);

  const val = `<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; margin: 0; padding: 0;">
    <div style="width: 80%; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
        <h1 style="color: #5c6bc0;">欢迎来到我的网页！</h1>
        <p style="line-height: 1.6;">这是一个简单的 HTML 示例页面，展示了如何使用常见的 HTML 标签和 CSS 样式。</p>
        <ul>
            <li>HTML 标签：如 <code>&lt;div&gt;</code>, <code>&lt;h1&gt;</code>, <code>&lt;p&gt;</code></li>
            <li>CSS 样式：如背景色、字体和阴影效果</li>
            <li>响应式设计：使用 <code>meta</code> 标签优化移动端显示</li>
        </ul>
        <footer>
            <p>© 2025 示例公司 | 版权所有</p>
        </footer>
    </div>
  </body>`;
  const htmlStr2 =
    "<table border='1' cellpadding='1' cellspacing='1' style='width:300px;'><tbody><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>序号</span></span></span></span></span></span></span></td><td style='border:solid windowtext 1.0pt; width:33.1pt; border-left:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>T</span></span></span></span></span></span></span></td><td style='border:solid windowtext 1.0pt; width:33.1pt; border-left:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>FI</span></span></span></span></span></span></span></td><td style='border:solid windowtext 1.0pt; width:33.1pt; border-left:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>DI</span></span></span></span></span></span></span></td></tr><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>1</span></span></span></span></span></span></span></td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td></tr><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>2</span></span></span></span></span></span></span></td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td></tr><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>3</span></span></span></span></span></span></span></td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td></tr><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>4</span></span></span></span></span></span></span></td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td></tr><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>5</span></span></span></span></span></span></span></td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td></tr><tr><td style='border:solid windowtext 1.0pt; width:33.1pt; border-top:none; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'><span style='font-size:6pt'><span style='text-justify:inter-ideograph'><span style='font-family:Tahoma,sans-serif'><span style='font-style:italic'><span lang='EN-US' style='font-size:10.0pt'><span style='font-family:黑体'><span style='font-style:normal'>6</span></span></span></span></span></span></span></td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td><td style='border-bottom:solid windowtext 1.0pt; width:33.1pt; border-top:none; border-left:none; border-right:solid windowtext 1.0pt; padding:0cm 5.4pt 0cm 5.4pt' valign='top' width='44'>&nbsp;</td></tr></tbody></table>";

  _html2img(val, sheet.getCell(10, 10));
  _html2img(htmlStr2, sheet.getCell(12, 12));
}

export function setHtmlCell() {
  const sheet = (store.spread as any).getActiveSheet();
  const selections = sheet.getSelections();
  if (selections.length === 0) {
    showAlert('请选择一个单元格', 'warning');
    return;
  }

  const html = promptModal({
    title: `请输入HTML片段`,
    defaultValue: '',
  });
  if (html) {
    const selection = selections[0];
    sheet.addSpan(selection.row, selection.col, selection.rowCount, selection.colCount);
    _html2img(html, sheet.getCell(selection.row, selection.col));
  }
}
