export function HighlightTagCellType(this) {
  GC.Spread.Sheets.CellTypes.Text.call(this);
  this.typeName = 'HighlightTagCellType';
}
window.HighlightTagCellType = HighlightTagCellType;
HighlightTagCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

// 绘制绑定路径
HighlightTagCellType.prototype.paint = function (
  ctx,
  value,
  x,
  y,
  w,
  h,
  style,
  context,
) {
  const sheet = context.sheet;
  const tag = sheet.getTag(context.row, context.col);
  if (tag) {
    style.decoration = {
      cornerFold: {
        size: 10,
        position: GC.Spread.Sheets.CornerPosition.rightTop,
        color: 'red',
      },
    };
  }
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [ctx, value, x, y, w, h, style, context]);
  // GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
};
