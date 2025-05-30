<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import { createMxCad, McObjectId, MxCADResbuf, MxCADSelectionSet } from 'mxcad';

  const props = withDefaults(
    defineProps<{
      mxFileUrl: string;
    }>(),
    {
      mxFileUrl: '',
    },
  );

  const mxCad = ref<any>(null);
  const entityColorList: any = {};
  const entityAllList: any[] = [];
  const emit = defineEmits(['getAllEntity', 'getAllEntityV2', 'selectEntityChange']);

  const registerEvent = (mxCad: any) => {
    mxCad.on('selectChange', (ids: McObjectId[]) => {
      if (ids.length > 0) {
        const firstEntity: any = ids[0].getMcDbEntity();
        emit('selectEntityChange', firstEntity);
        showEntryByPosition(firstEntity);
      }
    });
  };

  const getAllEntity = (mxCad: any) => {
    // 获取当前控件和数据库
    const mxcad = mxCad.getMxCpp().App.getCurrentMxCAD();
    const database = mxcad.getDatabase();
    // 获取块表
    const blockTable = database.getBlockTable();
    const blockIds = blockTable.getAllRecordId();
    const entityList: any[] = [];
    // 遍历块定义
    blockIds.forEach((blockId: any) => {
      const blockRecord = blockId.getMcDbBlockTableRecord();
      if (!blockRecord) return;

      // 遍历块内实体
      const entityIds = blockRecord.getAllEntityId();
      entityIds.forEach((entityId: any) => {
        const entity = entityId.getMcDbEntity();
        if (entity) {
          entityList.push(entity);
          entityAllList.push(entity);
          entityColorList[`${entity.alignmentPoint.x}-${entity.alignmentPoint.y}`] =
            entity.trueColor.clone();
        }
      });
    });
    emit('getAllEntity', entityList);
  };

  const getAllEntityV2 = (mxCad: any) => {
    const entityList: any[] = [];
    // 创建选择集实例
    const selectionSet = new MxCADSelectionSet();
    const filter = new MxCADResbuf();
    // 设置过滤器：仅选择文字和直线
    filter.AddMcDbEntityTypes('TEXT');
    // 选择所有图形元素
    selectionSet.allSelect(filter);
    // 遍历并获取所有实体
    selectionSet.forEach((objId: any) => {
      const entity = objId.getMcDbEntity();
      if (entity) {
        entityList.push(entity);
        entityAllList.push(entity);
        entityColorList[`${entity.alignmentPoint.x}-${entity.alignmentPoint.y}`] =
          entity.trueColor.clone();
      }
    });
    emit('getAllEntityV2', entityList);
  };

  const resetAllEntityColor = () => {
    Object.keys(entityColorList).forEach((key: any) => {
      const matchEntity = entityAllList.find(
        (entity: any) => `${entity.alignmentPoint.x}-${entity.alignmentPoint.y}` === key,
      );
      if (matchEntity) {
        const color = matchEntity.trueColor.clone();
        color.setRGB(
          entityColorList[key].red,
          entityColorList[key].green,
          entityColorList[key].blue,
        );
        matchEntity.trueColor = color;
        mxCad.value.getMxCpp().App.getCurrentMxCAD().updateDisplay();
      }
    });
  };

  const showEntryByPosition = (entry: any) => {
    const aliginPoint = entry.alignmentPoint;
    if (aliginPoint === undefined) {
      return;
    }
    mxCad.value.getMxCpp().App.getCurrentMxCAD().zoomAll();
    mxCad.value.getMxCpp().App.getCurrentMxCAD().zoomCenter(aliginPoint.x, aliginPoint.y);
    mxCad.value.getMxCpp().App.getCurrentMxCAD().zoomScale(9);

    resetAllEntityColor();
    const color = entry.trueColor.clone();
    color.setRGB(255, 0, 0);
    entry.trueColor = color;
    mxCad.value.getMxCpp().App.getCurrentMxCAD().updateDisplay();
  };

  const renderCad = () => {
    if (!props.mxFileUrl) {
      return;
    }
    return createMxCad({
      canvas: '#myCanvas',
      browse: 2,
      middlePan: 0,
      enableUndo: true,
      enableIntelliSelect: true,
      multipleSelect: false,
      locateFile: (fileName: string) => {
        return `/2d-st/${fileName}`;
      },
      fileUrl: props.mxFileUrl,
      fontspath: '/fonts',
      onOpenFileComplete: () => {
        console.log('onOpenFileComplete');
        registerEvent(mxCad.value);
        getAllEntityV2(mxCad.value);
      },
    }).then((mxCad: any) => {
      return mxCad;
    });
  };

  onMounted(async () => {
    mxCad.value = await renderCad();
  });

  watch(
    () => props.mxFileUrl,
    async () => {
      mxCad.value = await renderCad();
    },
  );

  defineExpose({
    showEntryByPosition,
  });
</script>

<template>
  <div class="wgh-container">
    <canvas id="myCanvas" />
  </div>
</template>

<style scoped lang="less">
  .wgh-container {
    width: 100vw;
    height: 1000px;
  }
</style>
