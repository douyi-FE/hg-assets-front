export const store = {
  designer: null,
  spread: null,
  formulaToRanges: GC.Spread.Sheets.CalcEngine.formulaToRanges,
  designerConfig: GC.Spread.Sheets.Designer.DefaultConfig,
  fbx: null,
  originalFile: null,
  emptyText: '上传',
  emptyToolTip: '点击上传文件',
  previewToolTip: '点击查看文件列表',
  isFilling: true,
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
  setAutoSetTableColumn(value: any) {
    this.autoSetTableColumn = value;
  },
  setMessage(value: any) {
    this.message = value;
  },
  setPromptModal(value: any) {
    this.promptModal = value;
  },
};
