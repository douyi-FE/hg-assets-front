export default class CustomPalette {
  static $inject = ['palette', 'create', 'elementFactory'];
  create: any;
  elementFactory: any;

  constructor(palette, create, elementFactory) {
    this.create = create;
    this.elementFactory = elementFactory;
    palette.registerProvider(this);
  }

  getPaletteEntries() {
    const { create, elementFactory } = this;

    function createUserTask() {
      return function (event) {
        const shape = elementFactory.createShape({
          type: 'bpmn:UserTask', // 明确指定类型为UserTask
          businessObject: {
            name: '用户任务',
          },
        });
        create.start(event, shape);
      };
    }

    return {
      'create.user-task': {
        group: 'activity',
        className: 'bpmn-icon-user-task',
        title: '创建用户任务',
        action: {
          dragstart: createUserTask(),
          click: createUserTask(),
        },
      },
      'create.custom-task': {
        group: 'activity',
        className: 'bpmn-icon-task custom-task',
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
      type: 'bpmn:Task',
      customType: 'custom-task', // 添加自定义属性
    });

    this.create.start(event, shape);
  }
}
