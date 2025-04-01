export default function CustomPropertiesProvider(propertiesPanel, translate) {
  // 注册自定义属性提供器
  this.getGroups = function (element) {
    return function (groups) {
      // 针对 UserTask 类型任务添加自定义属性组
      if (element.type === 'bpmn:UserTask') {
        // 添加一个新的属性组 "customGroup"
        groups.push(createCustomGroup(element, translate));
      }
      // 新增：针对 StartEvent 的配置
      if (element.type === 'bpmn:StartEvent') {
        groups.push(createStartEventGroup(element, translate));
      }
      return groups;
    };
  };

  // 自定义属性组配置
  function createCustomGroup(element, translate) {
    return {
      id: 'custom-group',
      label: translate('审批配置'),
      entries: [
        {
          id: 'approver',
          html: `
            <div class="bpp-row bpp-textfield" data-entry="approver">
              <label for="approver">审批人</label>
              <div class="bpp-field-wrapper">
                <input id="camunda-approver" type="text" name="approver" />
              </div>
            </div>
          `,
          modelProperty: 'approver',
          get: function (element) {
            return {
              approver: element.businessObject.get('custom:approver'),
            };
          },
          set: function (element, values) {
            return {
              'custom:approver': values.approver || '',
            };
          },
        },
        {
          id: 'comment',
          html: `
            <div class="bpp-row bpp-textfield" data-entry="comment">
              <label for="comment">审批意见</label>
              <div class="bpp-field-wrapper">
                <textarea id="camunda-comment" name="comment"></textarea>
              </div>
            </div>
          `,
          modelProperty: 'comment',
          get: function (element) {
            return {
              comment: element.businessObject.get('custom:comment'),
            };
          },
          set: function (element, values) {
            return {
              'custom:comment': values.comment || '',
            };
          },
        },
      ],
    };
  }

  // 新增：StartEvent 属性组
  function createStartEventGroup(element, translate) {
    return {
      id: 'start-event-group',
      label: translate('事件配置'),
      entries: [
        {
          id: 'triggerType',
          label: translate('触发类型'),
          type: 'select',
          modelProperty: 'triggerType',
          defaultValue: 'none',
          get: function (element) {
            return {
              triggerType: element.businessObject.get('custom:triggerType') || 'none',
            };
          },
          set: function (element, values) {
            return { 'custom:triggerType': values.triggerType || 'none' };
          },
          selectOptions: [
            { name: '无', value: 'none' },
            { name: '定时触发', value: 'timer' },
            { name: '消息触发', value: 'message' },
          ],
        },
        {
          id: 'formKey',
          label: translate('关联表单'),
          type: 'text',
          modelProperty: 'formKey',
          description: '填写表单 ID',
          get: function (element) {
            return { formKey: element.businessObject.get('custom:formKey') };
          },
          set: function (element, values) {
            return { 'custom:formKey': values.formKey || '' };
          },
        },
      ],
    };
  }

  // 注册提供器到属性面板
  propertiesPanel.registerProvider(this);
}

CustomPropertiesProvider.$inject = ['propertiesPanel', 'translate'];
