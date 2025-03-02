// 模板单元格类型
// 结合了显示绑定路径和校验信息两个特性
export function TemplateCellType() {
  GC.Spread.Sheets.CellTypes.Text.call(this);
  this.typeName = 'TemplateCellType';
}
TemplateCellType.prototype = new GC.Spread.Sheets.CellTypes.Text();
TemplateCellType.prototype.getHitInfo = function (x, y, cellStyle, cellRect, context) {
  const info = {
    x: x,
    y: y,
    row: context.row,
    col: context.col,
    cellStyle: cellStyle,
    cellRect: cellRect,
    sheetArea: context.sheetArea,
  };
  return info;
};

// 绘制绑定路径
TemplateCellType.prototype.paint = function (ctx, value, x, y, w, h, style, context) {
  const sheet = context.sheet;
  if (sheet) {
    const bindingPath = sheet.getBindingPath(context.row, context.col);
    if (bindingPath) {
      value = '[' + bindingPath + ']';
    }
  }
  GC.Spread.Sheets.CellTypes.Text.prototype.paint.apply(this, arguments);
};

// 控制数据校验错误提示的出现
TemplateCellType.prototype.processMouseMove = function (hitInfo) {
  const sheet = hitInfo.sheet;
  const dv = sheet.getDataValidator(hitInfo.row, hitInfo.col);
  const val = sheet.getValue(hitInfo.row, hitInfo.col);
  if (dv && !sheet.isValid(hitInfo.row, hitInfo.col, val)) {
    dv.showInputMessage(true);
    return true;
  }
  return false;
};
TemplateCellType.prototype.processMouseLeave = function (hitInfo) {
  const sheet = hitInfo.sheet;
  const dv = sheet.getDataValidator(hitInfo.row, hitInfo.col);
  if (dv) {
    dv.showInputMessage(false);
    return true;
  }
  return false;
};
