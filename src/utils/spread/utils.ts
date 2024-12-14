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
