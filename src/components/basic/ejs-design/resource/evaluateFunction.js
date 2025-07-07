/*------自定义Evaluate函数------*/
export function Evaluate() {
  //函数名
  // this.name = 'Evaluate';
  // 自定义元素序列化
  this.typeName = 'Evaluate';
  GC.Spread.CalcEngine.Functions.Function.apply(this, ["Evaluate", 0, 0]);
  //最大参数个数
  this.maxArgs = 1;
  //最小参数个数
  this.minArgs = 1;
};
window.Evaluate = Evaluate;
Evaluate.prototype = new GC.Spread.CalcEngine.Functions.Function();
//函数的参数接受引用单元格区域
Evaluate.prototype.acceptsReference = function () {
  return true;
}
//为true 时，函数的计算依赖于上下文
Evaluate.prototype.isContextSensitive = function () {
  return true;
}
Evaluate.prototype.evaluate = function (arg, val) {
  if (val.getColumn && val.getColumn() >= 0) {
    let formulaString = null;
    const row = val.getRow();
    const column = val.getColumn();
    const rowCount = val.getRowCount();
    const columnCount = val.getColumnCount();
    if (rowCount > 1 || columnCount > 1) {
      return '仅支持单格计算';
    }
    const sheet = val.getSource().getSheet();
    formulaString = sheet.getValue(row, column);
    // 如果不是String类型，则转为String
    if (typeof formulaString !== 'string') {
      formulaString = formulaString ? formulaString + '' : null;
    }
    if (formulaString === null || formulaString === undefined || formulaString === '' || formulaString === 'null' || formulaString === 'undefined' || formulaString === 0) {
      formulaString = '0';
    }
    return GC.Spread.Sheets.CalcEngine.evaluateFormula(sheet, formulaString, 0, 0);
  }
  return '参数错误';
}
Evaluate.prototype.description = function () {
  return {
    description: "计算表达式的值",
    parameters: [{
      name: "value",
      description: "引用单元格"
    }]
  }
}