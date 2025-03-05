export const store = {
  designer: null,
  spread: null,
  formulaToRanges: GC.Spread.Sheets.CalcEngine.formulaToRanges,
  designerConfig: GC.Spread.Sheets.Designer.DefaultConfig,
  fbx: null,
  originalFile: null,
  initDataSource: {},
  bindingPaths: {},
  selections: {
    sheet: '',
    range: '',
  },
  message: (options: any) => {
    alert(options.message);
  },
  promptModal: (options: any) => {
    return window.prompt(options.title, options.defaultValue);
  },

  autoSetTableColumn: false,
  setDesigner(value: any) {
    this.designer = value;
  },

  setSpread(value: any) {
    this.spread = value;
  },
  setFbx(value: any) {
    this.fbx = value;
  },
  setOriginalFile(value: any) {
    this.originalFile = value;
  },
  setInitDataSource(value: any) {
    this.initDataSource = value;
  },
  setBindingPaths(value: any) {
    this.bindingPaths = value;
  },
  setAutoSetTableColumn(value: any) {
    this.autoSetTableColumn = value;
  },
  setSelections(value: any) {
    this.selections = value;
  },
  setMessage(value: any) {
    this.message = value;
  },
  setPromptModal(value: any) {
    this.promptModal = value;
  },
};
