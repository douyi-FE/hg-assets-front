<template>
  <div class="canvas-content" :style="{ height: `${height}px` }">
    <div ref="canvas" class="canvas" />
    <div id="js-properties-panel" class="panel" />
  </div>
</template>

<script lang="ts" setup>
  import 'bpmn-js/dist/assets/bpmn-js.css';
  import 'bpmn-js/dist/assets/diagram-js.css';
  import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
  import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
  import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
  import '@bpmn-io/properties-panel/dist/assets/properties-panel.css';
  import { ref, onMounted, nextTick, onBeforeUnmount } from 'vue';
  import BpmnModeler from 'bpmn-js/lib/Modeler';
  import {
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
  } from 'bpmn-js-properties-panel';
  import gridModule from 'diagram-js-grid';
  import camundaModdleDescriptor from 'camunda-bpmn-moddle/resources/camunda.json';
  import { xmlStr as defaultXmlStr } from './xml';
  import translations from './customTranslate';
  import customPaletteModule from './custom-modules/palette';
  import CustomPropertiesProvider from './properties-provider/CustomPropertiesProvider'; // 导入自定义提供器

  const props = defineProps({
    xmlStr: {
      type: String,
      default: defaultXmlStr,
    },
    height: {
      type: Number,
      default: 850,
    },
  });

  const emits = defineEmits([
    'shape.added',
    'shape.move.end',
    'connect.end',
    'connection.create',
    'connection.move',
  ]);

  const canvas = ref();
  const loading = ref(true);
  let bpmnModeler: any = null;

  const initBpmn = () => {
    bpmnModeler = new BpmnModeler({
      container: canvas.value,
      propertiesPanel: {
        parent: '#js-properties-panel',
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        gridModule,
        { translate: ['value', translations] },
        customPaletteModule,
        {
          // 注入自定义属性提供器
          __init__: ['customPropertiesProvider'],
          customPropertiesProvider: ['type', CustomPropertiesProvider],
        },
      ],
      moddleExtensions: {
        camunda: camundaModdleDescriptor,
      },
    });
    createNewDiagram();
  };

  const createNewDiagram = async () => {
    transformCanvas(props.xmlStr || defaultXmlStr);
  };

  const transformCanvas = (bpmnXmlStr: string) => {
    bpmnModeler
      .importXML(bpmnXmlStr)
      .then(() => {
        success();
      })
      .finally(() => {
        const canvasInstance = bpmnModeler.get('canvas');
        canvasInstance.zoom('fit-viewport');
        canvasInstance.resized();
      });
  };

  const success = () => {
    addModelerListener();
    console.log('success');
  };

  const addModelerListener = () => {
    const events = [
      'shape.added',
      'shape.move.end',
      'connect.end',
      'connection.create',
      'connection.move',
    ];
    events.forEach((event) => {
      bpmnModeler.on(event, (e: any) => {
        const elementRegistry = bpmnModeler.get('elementRegistry');
        const shape = e.element ? elementRegistry.get(e.element.id) : e.shape;
        emits(event as any, shape);
      });
    });
  };

  const init = async () => {
    loading.value = true;
    loading.value = false;
    await nextTick();
    initBpmn();
  };

  const getXml = async () => {
    try {
      const result = await bpmnModeler.saveXML({ format: true });
      const modeler = bpmnModeler.get('moddle');
      const elementRegistry = bpmnModeler.get('elementRegistry');

      elementRegistry.getAll().forEach((element) => {
        if (element.type === 'bpmn:Task') {
          element.type = 'bpmn:UserTask';
          element.businessObject.$type = 'bpmn:UserTask';
        }
      });

      return await bpmnModeler.saveXML({ format: true });
    } catch (err) {
      console.error('Error saving XML:', err);
      return null;
    }
  };

  const getSvg = () => {
    return bpmnModeler.saveSVG();
  };

  onMounted(init);

  onBeforeUnmount(() => {
    bpmnModeler.destroy();
  });

  defineExpose({
    getXml,
    getSvg,
  });
</script>

<style lang="less" scoped>
  .canvas-content {
    display: flex;
    flex-grow: 1;
    min-height: 950px;
    padding: 10px;
    column-gap: 10px;
    background-color: #f5f5f5;

    .canvas {
      flex-grow: 1;
      background-color: #fff;
    }

    .panel {
      width: 300px;
      background-color: #fff;
    }
  }
</style>
