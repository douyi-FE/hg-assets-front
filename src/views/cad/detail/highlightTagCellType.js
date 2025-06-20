export const tagList = [];

export function HighlightTagCellType() {
  GC.Spread.Sheets.CellTypes.Text.call(this);
  this.typeName = 'HighlightTagCellType';
}
window.HighlightTagCellType = HighlightTagCellType;
HighlightTagCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();

// 绘制绑定路径
HighlightTagCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
  const sheet = context.sheet;
  const tag = sheet.getTag(context.row, context.col);
  // 消除单元格按钮
  // if (CurrentMode === 'view') {
  //   style.cellButtons = [];
  // }
  if (Array.isArray(tag?.entites) && tag.entites.find((item) => item.handle)) {
    // 红色三角
    style.decoration = {
      cornerFold: {
        size: 10,
        position: GC.Spread.Sheets.CornerPosition.rightTop,
        color: 'red',
      },
    };
    const existIndex = tagList.findIndex(
      (item) => item.row === context.row && item.col === context.col,
    );
    // 未存在，则添加
    if (existIndex === -1) {
      tagList.push({
        row: context.row,
        col: context.col,
        tag: tag,
        sheetName: context.sheet.name(),
      });
    } else {
      // 存在，则更新
      tagList[existIndex].tag = tag;
    }
  }
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, [
    ctx,
    value,
    x,
    y,
    w,
    h,
    style,
    context,
  ]);
  // GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
};
