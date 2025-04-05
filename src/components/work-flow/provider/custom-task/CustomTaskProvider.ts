import { defineCustomElement } from 'vue';
import { is } from 'bpmn-js/lib/util/ModelUtil';
import { html } from 'diagram-js/lib/ui/index';
import { message } from 'ant-design-vue';
import SettingPanel from './setting-panel.vue';
import { eventBus } from '@/utils/event-bus';

const LOW_PRIORITY = 500;

// 将 Vue 组件转换为 Web Component
const MyElement = defineCustomElement(SettingPanel, { shadowRoot: false });
customElements.define('custom-task', MyElement);

function isJsonString(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}
function convertExtensionsToObject(extensionElements: any) {
  if (!extensionElements?.values) return {};
  const result = {};
  // 遍历所有扩展元素
  extensionElements.values.forEach((ext) => {
    // 处理 Camunda 属性
    if (ext.$type === 'camunda:Properties' && ext.values) {
      ext.values.forEach((prop) => {
        try {
          // 自动解析 JSON 字符串值
          result[prop.name] = isJsonString(prop.value) ? JSON.parse(prop.value) : prop.value;
        } catch (e) {
          console.warn(`解析属性 ${prop.name} 失败:`, e);
          result[prop.name] = prop.value;
        }
      });
    }
  });

  return result;
}

function createExtensionElements(bpmnFactory, payload = {}) {
  const extensionElements = bpmnFactory.create('bpmn:ExtensionElements', {
    values: [
      bpmnFactory.create('camunda:Properties', {
        values: Object.entries(payload).map(([name, value]) =>
          bpmnFactory.create('camunda:Property', {
            name,
            value: typeof value === 'string' ? value : JSON.stringify(value),
          }),
        ),
      }),
    ],
  });
  return extensionElements;
}

function createCustomGroup(element: any, translate: any, modeling: any, bpmnFactory: any) {
  const customGroup = {
    id: 'custom_task',
    label: translate('任务配置'),
    entries: [
      {
        id: 'custom_task',
        element: element,
        component: (props: any) => {
          eventBus.off(`bpmn-action-${props.element.id}`);
          eventBus.on(`bpmn-action-${props.element.id}`, (event: any) => {
            console.log('收到事件:', modeling, event.payload);
            // 1. 创建 ExtensionElements 容器
            const extensionElements = createExtensionElements(bpmnFactory, event.payload);
            // 更新元素扩展数据
            // 3. 更新元素属性
            modeling.updateProperties(props.element, {
              extensionElements: extensionElements, // ✅ 符合 BPMN 规范
            });
            message.success('保存成功');
          });

          const elementData = {
            id: props.element.id,
            extends: convertExtensionsToObject(props.element.di.bpmnElement.extensionElements),
          };

          return html`<custom-task element="${JSON.stringify(elementData)}"></custom-task>`;
        },
        isEdited: () => false,
      },
    ],
  };

  return customGroup;
}

export default function CustomPropertiesProvider(this: any, injector: any) {
  const modeling = injector.get('modeling');
  const bpmnFactory = injector.get('bpmnFactory');
  const translate = injector.get('translate');
  const propertiesPanel = injector.get('propertiesPanel');
  this.getGroups = function (element: any) {
    return function (groups: any) {
      // Add the "magic" group
      if (is(element, 'bpmn:UserTask')) {
        groups.push(createCustomGroup(element, translate, modeling, bpmnFactory));
      }

      return groups;
    };
  };
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

CustomPropertiesProvider.$inject = ['injector'];
