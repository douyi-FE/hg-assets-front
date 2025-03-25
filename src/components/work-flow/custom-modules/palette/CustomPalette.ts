// src/components/work-flow/custom-modules/palette/CustomPalette.ts
export default class CustomPalette {
  static $inject = ['palette', 'create', 'elementFactory'];
  palette: any;
  create: any;
  elementFactory: any;

  constructor(palette, create, elementFactory) {
    this.palette = palette;
    this.create = create;
    this.elementFactory = elementFactory;

    // 注册为额外的面板提供者（不会覆盖默认面板）
    palette.registerProvider(this);
  }

  getPaletteEntries() {
    // 只添加自定义节点，不影响标准节点
    return {
      'create.custom-task': {
        group: 'activity',
        className: 'bpmn-icon-user-task', // 可以自定义图标
        title: '自定义任务',
        action: {
          dragstart: this.createCustomTask.bind(this),
          click: this.createCustomTask.bind(this),
        },
      },
    };
  }

  createCustomTask(event) {
    const shape = this.elementFactory.createShape({
      type: 'bpmn:UserTask',
      customType: 'custom-task', // 添加自定义属性标识
    });
    this.create.start(event, shape);
  }
}
