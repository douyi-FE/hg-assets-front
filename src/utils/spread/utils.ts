import templateCostJSON from '../../templates/cost.json';

// 绑定初始数据
const bindInitialData = (spread, taskId) => {
  let data = {
    id: `成本NV-${Math.random().toString()}`, //项目编号
    name: '', //项目名称
    city: '', //项目所在地
    customer: '', //客户名称
    price: 0, //本次报价
  };
  let source = new (GC as any).Spread.Sheets.Bindings.CellBindingSource(data);
  spread.suspendPaint();
  let sheetCount = spread.getSheetCount();
  for (let i = 0; i < sheetCount; i++) {
    let sheet = spread.getSheet(i);
    sheet.setDataSource(source);
  }
  spread.resumePaint();
  taskId.value = data.id;
};

/**
 * 预算下发阶段,和designer相关的阶段
 */
export const getPreivewConfig = () => {
  // 自定制designer
  let config = JSON.parse(JSON.stringify(GC.Spread.Sheets.Designer.DefaultConfig));
  config.ribbon.push({
    id: 'fill-custom',
    text: '预算操作（定制按钮）',
    active: true,
    buttonGroups: [
      {
        label: '预算类型',
        commandGroup: {
          children: ['selectBudgetType'],
        },
      },
      {
        label: '预算编制',
        thumbnailClass: 'ribbon-thumbnail-editing',
        commandGroup: {
          children: ['distributeTask'],
        },
      },
      {
        label: '数据',
        commandGroup: {
          children: ['clearLocalData'],
        },
      },
    ],
  });
  config.commandMap = {
    selectBudgetType: {
      text: '选择预算类型',
      comboWidth: 120,
      type: 'comboBox',
      commandName: 'selectBudgetType',
      dropdownList: [
        {
          text: '成本预算',
          value: 'cost',
        },
        {
          text: '销售预算',
          value: 'sales',
        },
      ],
    },
    distributeTask: {
      title: '下发预算任务',
      text: '预算编制',
      iconClass: 'distribute-icon',
      bigButton: true,
      commandName: 'distributeTask',
    },
    clearLocalData: {
      title: '清除本地缓存',
      text: '清除本地缓存',
      iconClass: 'clear-local-icon',
      bigButton: true,
      commandName: 'clearLocalData',
      execute: function () {
        localStorage.clear();
      },
    },
  };
  return config;
};

// 加载文件
export const loadTemplate = async (designer, taskId) => {
  let template = templateCostJSON;
  let spread = designer.getWorkbook();
  spread.suspendPaint();
  spread.fromJSON(template);
  bindInitialData(spread, taskId);
  spread.resumePaint();
  if (designer && template.designerBindingPathSchema) {
    designer.setData('treeNodeFromJson', JSON.stringify(template.designerBindingPathSchema));
    designer.setData('oldTreeNodeFromJson', JSON.stringify(template.designerBindingPathSchema));
    designer.setData('updatedTreeNode', JSON.stringify(template.designerBindingPathSchema));
    designer.refresh();
  }
};

// 初始化工作簿
export const initWorkbook = function (spread) {
  const sheet = spread.getActiveSheet();
  const defaultStyle = sheet.getDefaultStyle();
  // 设置垂直居中
  defaultStyle.vAlign = GC.Spread.Sheets.VerticalAlign.center;
  sheet.setDefaultStyle(defaultStyle);
  // 设置表格主题样式
  const border = new GC.Spread.Sheets.LineBorder();
  border.color = '#000000';
  border.style = GC.Spread.Sheets.LineStyle.thin;
  const styleInfo = new GC.Spread.Sheets.Tables.TableStyle(
    '#ffffff',
    '#000000',
    'normal normal 16px 仿宋',
    border,
    border,
    border,
    border,
    border,
    border,
  );
  const standardTheme = new GC.Spread.Sheets.Tables.TableTheme();
  standardTheme.name('standard');
  standardTheme.wholeTableStyle(styleInfo);
  standardTheme.headerRowStyle(styleInfo);
  standardTheme.firstRowStripStyle(styleInfo);
  standardTheme.firstColumnStripStyle(styleInfo);
  standardTheme.footerRowStyle(styleInfo);
  standardTheme.highlightFirstColumnStyle(styleInfo);
  standardTheme.highlightLastColumnStyle(styleInfo);
  spread.customTableThemes.add(standardTheme);
};
