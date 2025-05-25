import { message } from 'ant-design-vue';
export const initCustomInsertRows = function (spread) {
  const commandManager = spread.commandManager();
  const insertRowsBefore = {
    text: "向上插入",
    name: "insertRowsBefore",
    command: "insertRowsBefore",
    workArea: "rowHeader"
  };
  spread.contextMenu.menuData.push(insertRowsBefore);
  const insertRowsAfter = {
    text: "向下插入",
    name: "insertRowsAfter",
    command: "insertRowsAfter",
    workArea: "rowHeader"
  };
  spread.contextMenu.menuData.push(insertRowsAfter);

  const insertRowsByCountsBefore = {
    canUndo: false,
    execute: function (spread, options) {
      executeInsertRows(spread, options, true);
    }
  };
  const insertRowsByCountsAfter = {
    canUndo: false,
    execute: function (spread, options) {
      executeInsertRows(spread, options, false);
    }
  };
  commandManager.register("insertRowsBefore", insertRowsByCountsBefore, null, false, false, false, false);
  commandManager.register("insertRowsAfter", insertRowsByCountsAfter, null, false, false, false, false);
  function CustomMenuView() {
  }
  CustomMenuView.prototype = new GC.Spread.Sheets.ContextMenu.MenuView();
  CustomMenuView.prototype.createMenuItemElement = function (menuItemData) {
    const self = this;
    if (menuItemData.name === "insertRowsBefore" || menuItemData.name === "insertRowsAfter") {
      const containers = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
      const supMenuItemContainer = containers[0];
      const inputBlock = createInput(menuItemData.name);
      supMenuItemContainer.appendChild(inputBlock);
      return supMenuItemContainer;
    } else {
      const menuItemView = GC.Spread.Sheets.ContextMenu.MenuView.prototype.createMenuItemElement.call(self, menuItemData);
      return menuItemView;
    }
  }
  CustomMenuView.prototype.getCommandOptions = function (menuItemData, host, event) {
    if (menuItemData && (menuItemData.name === "insertRowsBefore" || menuItemData.name === "insertRowsAfter")) {
      // const ele = event.target || event.srcElement;
      const ele = document.getElementsByClassName(menuItemData.name)[0]
      return ele.value;
    }
  };
  spread.contextMenu.menuView = new CustomMenuView();
}

function executeInsertRows(spread, options, before = false) {
  if (options.commandOptions) {
    console.log('增加行数' + options.commandOptions);
    const value = parseInt(options.commandOptions);
    if (!checkValue(value)) {
      return;
    }
    const sheet = spread.getSheetFromName(options.sheetName)
    sheet.suspendPaint()
    if (before) {
      sheet.addRows(options.activeRow, parseInt(options.commandOptions))
    } else {
      sheet.addRows(options.activeRow + 1, parseInt(options.commandOptions))
    }
    sheet.resumePaint()
  }
}

function checkValue(value) {
  if (Number.isNaN(value)) {
    message.error('请输入正确的数字');
    return false;
  }
  if (value <= 0) {
    message.error('请输入大于0的数字');
    return false;
  }
  if (value > 1000) {
    message.error('请输入小于1000的数字');
    return false;
  }
  return true;
}

function createInput(className) {
  const input = document.createElement("input");
  input.className = className;
  input.value = "1";
  input.style.width = '60px';
  input.addEventListener('click', function (ev) {
    ev.stopPropagation();
  });
  input.addEventListener('input', function (ev) {
    ev.stopPropagation();
  });
  input.addEventListener('keydown', function (ev) {
    ev.stopPropagation();
  });
  return input;
}