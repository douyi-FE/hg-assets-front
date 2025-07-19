import { cloneDeep } from 'lodash-es';
import { store } from '../store';
import {
  getInitData,
  getSheetBindingPaths,
  importFile,
  setChineseFont,
  showAlert,
} from './commonFunctions';
import { setHtmlCell } from './htmlCell';
import { clearSelections, startSelectMode } from './initFormulaBar';
import { addScript, runScript } from './scripts';
import { setFieldsModel } from './setFieldsModel';
import { printPreview } from './printPreview';
import { conditionFormatConfig } from './conditionFormatsConfig';
import { setTableColumn } from './tableFunctions';
// 初始化设计器及相关菜单项
export function initDesigner(divId) {
  // 获取初始化配置
  let config = cloneDeep(store.designerConfig);
  // 删除 fileMenu
  // delete config.fileMenu;

  // 配置自定义命令
  config.commandMap = {
    Import: {
      title: '导入模板',
      text: '导入模板',
      iconClass: 'importFile',
      bigButton: 'false',
      commandName: 'importTemplate',
      execute: async (context, propertyName) => {
        document.getElementById('selectedFile')?.click();
      },
    },
    // Download: {
    //   title: '载入模板',
    //   text: '载入模板',
    //   iconClass: 'download',
    //   bigButton: 'false',
    //   commandName: 'downloadTemplate',
    //   execute: async (context, propertyName) => {
    //     openTemplate();
    //   },
    // },
    // Upload: {
    //   title: '上传模板',
    //   text: '上传模板',
    //   iconClass: 'upload',
    //   bigButton: 'false',
    //   commandName: 'uploadTemplate',
    //   execute: async (context, propertyName) => {
    //     saveTemplate();
    //   },
    // },
    AddScript: {
      title: '添加脚本',
      text: '添加脚本',
      iconClass: 'ribbon-button-formControl',
      bigButton: 'false',
      commandName: 'addScript',
      execute: async (context, propertyName) => {
        addScript();
      },
    },
    RunScript: {
      title: '执行脚本',
      text: '执行脚本',
      iconClass: 'runScript',
      bigButton: 'false',
      commandName: 'runScript',
      execute: async (context, propertyName) => {
        runScript();
      },
    },
    HtmlCell: {
      title: 'Html单元格',
      text: 'Html单元格',
      iconClass: 'ribbon-button-template',
      bigButton: 'false',
      commandName: 'htmlCell',
      execute: async (context, propertyName) => {
        setHtmlCell();
      },
    },
    SelectTableTitle: {
      title: '设置填报表头',
      text: '设置填报表头',
      iconClass: 'ribbon-button-rangetemplatecelltype',
      bigButton: 'false',
      commandName: 'selectTableTitle',
      execute: async (context, propertyName) => {
        startSelectMode('选择填报表头区域', 'tableTitle');
      },
    },
    SelectFields: {
      title: '设置填报字段',
      text: '设置填报字段',
      iconClass: 'ribbon-control-dropdown-insertSheet',
      bigButton: 'false',
      commandName: 'selectFields',
      execute: async (context, propertyName) => {
        const sheet = (store.spread as any).getActiveSheet();
        setFieldsModel(getSheetBindingPaths(sheet));
      },
    },
    ResetAll: {
      title: '重置',
      text: '重置',
      iconClass: 'resetAll',
      bigButton: 'false',
      commandName: 'resetAll',
      execute: async (context, propertyName) => {
        clearSelections();
      },
    },
    ShowData: {
      title: '输出初始化数据',
      text: '输出初始化数据',
      iconClass: 'ribbon-button-textToColumn',
      bigButton: 'false',
      commandName: 'showData',
      execute: async (context, propertyName) => {
        console.log(getInitData());
        showAlert('在控制台查看初始化数据', 'success');
      },
    },
    PrintPreview: {
      title: '打印预览',
      text: '打印预览',
      iconClass: 'ribbon-button-page-setup-print-area',
      bigButton: 'false',
      commandName: 'printPreview',
      execute: async (context, propertyName) => {
        await printPreview();
      },
    },
    // AutoSetTableColumn: {
    //   text: '自动应用到整列',
    //   type: 'checkbox',
    //   bigButton: true,
    //   commandName: 'autoSetTableColumn',
    //   execute: async (context, propertyName) => {
    //     store.setAutoSetTableColumn(!store.autoSetTableColumn);
    //   },
    //   getState: (context) => {
    //     return store.autoSetTableColumn;
    //   },
    // },
    SetTableColumn: {
      title: '第一行应用到整表',
      text: '第一行应用到整表',
      iconClass: 'ribbon-button-formattable',
      bigButton: 'false',
      commandName: 'setTableColumn',
      execute: async (context, propertyName) => {
        const sheet = (store.spread as any).getActiveSheet();
        setTableColumn(sheet);
      },
    },
    // DesignerFormatCells: {
    //   title: '设置单元格格式',
    //   text: '设置单元格格式',
    //   iconClass: 'ribbon-button-formattable',
    //   bigButton: 'false',
    //   commandName: 'designerFormatCells',
    //   execute: async (context, propertyName) => {
    //     (store.spread as any).commandManager().execute({
    //       cmd: 'formatCells',
    //       sheetName: (store.spread as any).getActiveSheet().name(),
    //     });
    //   },
    // },
    SetAttach: {
      title: '设置附件',
      text: '设置附件',
      iconClass: 'ribbon-button-namemanager',
      bigButton: 'false',
      commandName: 'setAttach',
      execute: async (context, propertyName) => {
        startSelectMode('选择附件区域', 'fileAttach');
      },
    },
  };
  config.ribbon.unshift({
    id: 'templateTab',
    text: '模板',
    buttonGroups: [],
  });

  // 配置文件组菜单
  config.ribbon[0].buttonGroups.push({
    label: '文件',
    thumbnailClass: 'welcome',
    commandGroup: {
      children: [
        {
          direction: 'vertical',
          commands: ['Import'],
        },
        {
          direction: 'vertical',
          commands: ['Download'],
        },
        {
          direction: 'vertical',
          commands: ['Upload'],
        },
      ],
    },
  });

  // 配置模板组菜单
  config.ribbon[0].buttonGroups.push({
    label: '绑定设置',
    thumbnailClass: 'welcome',
    commandGroup: {
      children: [
        {
          direction: 'vertical',
          commands: ['SelectTableTitle'],
        },
        {
          direction: 'vertical',
          commands: ['SelectFields'],
        },
      ],
    },
  });
  // 配置模板列相关
  config.ribbon[0].buttonGroups.push({
    label: '列设置',
    thumbnailClass: 'ribbon-thumbnail-datatools',
    commandGroup: {
      children: [
        {
          direction: 'vertical',
          commands: ['SetTableColumn'],
        },
        // {
        //   direction: 'vertical',
        //   commands: ['DesignerFormatCells'],
        // },
        {
          children: ['dropdownDataValidation', 'circleInvalidDataCommand', 'clearInvalidCircles'],
          command: 'dataValidation',
          type: 'dropdown',
        },
        {
          children: [
            {
              children: [
                'ribbonButtonButtonCellType',
                'checkboxCellType',
                'comboBoxCellType',
                'fileUploadCellType',
                'hyperlinkCellType',
                'rangeTemplateCellType',
                'separator',
                'checkboxListCellType',
                'radioListCellType',
                'buttonListCellType',
                'separator',
                'clearCellType',
              ],
              command: 'cellType',
              type: 'dropdown',
            },
            {
              children: [
                'calculatorCellType',
                'colorPickerCellType',
                'dateTimePickerCellType',
                'listCellType',
                'monthPickerCellType',
                'sliderCellType',
                'timePickerCellType',
                'workflowList',
                'multiColumnPicker',
                'separator',
                'clearCellDropdown',
              ],
              command: 'cellDropdowns',
              type: 'dropdown',
            },
          ],
          command: 'cellEditors',
          type: 'dropdown',
        },
        {
          direction: 'vertical',
          commands: ['SetAttach'],
        },
        conditionFormatConfig,
      ],
    },
  });

  // 配置脚本菜单
  config.ribbon[0].buttonGroups.push({
    label: '脚本',
    thumbnailClass: 'welcome',
    commandGroup: {
      children: [
        {
          direction: 'vertical',
          commands: ['AddScript'],
        },
        {
          direction: 'vertical',
          commands: ['RunScript'],
        },
      ],
    },
  });

  // 配置HTML菜单
  config.ribbon[0].buttonGroups.push({
    label: 'HTML',
    thumbnailClass: 'welcome',
    commandGroup: {
      children: [
        {
          direction: 'vertical',
          commands: ['HtmlCell'],
        },
      ],
    },
  });

  // 配置操作菜单
  config.ribbon[0].buttonGroups.push({
    label: '操作',
    thumbnailClass: 'welcome',
    commandGroup: {
      children: [
        {
          direction: 'vertical',
          commands: ['ResetAll'],
        },
        {
          direction: 'vertical',
          commands: ['ShowData'],
        },
        {
          direction: 'vertical',
          commands: ['PrintPreview'],
        },
      ],
    },
  });

  // 去掉表设计visibleWhen属性
  config.ribbon.forEach((item) => {
    if (item.id === 'tableDesign') {
      delete item.visibleWhen;
    }
  });

  document.getElementById('selectedFile')?.addEventListener('change', function (event: any) {
    let file = event.target.files[0];
    if (!file) {
      return;
    }
    importFile(file);
  });

  config = setChineseFont(config);

  const designer = new GC.Spread.Sheets.Designer.Designer(document.getElementById(divId), config);
  document.querySelector('.big-button')?.classList.remove('big-button');
  return designer;
}
