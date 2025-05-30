<script setup lang="ts">
  import { onMounted, ref, watch } from 'vue';
  import {
    createMxCad,
    MxCADResbuf,
    MxCADSelectionSet,
    McDbLine,
    McCmColor,
    McGePoint3d,
  } from 'mxcad';

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
  const entityAllLineList: any[] = [];
  const emit = defineEmits(['getAllEntity', 'getAllEntityV2', 'selectEntityChange']);

  const registerEvent = (mxCad: any) => {
    mxCad.on('selectChange', (ids: any[]) => {
      if (ids.length > 0) {
        const firstEntity: any = ids[0].getMcDbEntity();
        emit('selectEntityChange', firstEntity);
        showEntryByPosition(firstEntity);
      }
    });
  };

  // const getAllEntity = (mxCad: any) => {
  //   // 获取当前控件和数据库
  //   const mxcad = mxCad.getMxCpp().App.getCurrentMxCAD();
  //   const database = mxcad.getDatabase();
  //   // 获取块表
  //   const blockTable = database.getBlockTable();
  //   const blockIds = blockTable.getAllRecordId();
  //   const entityList: any[] = [];
  //   // 遍历块定义
  //   blockIds.forEach((blockId: any) => {
  //     const blockRecord = blockId.getMcDbBlockTableRecord();
  //     if (!blockRecord) return;

  //     // 遍历块内实体
  //     const entityIds = blockRecord.getAllEntityId();
  //     entityIds.forEach((entityId: any) => {
  //       const entity = entityId.getMcDbEntity();
  //       if (entity) {
  //         entityList.push(entity);
  //         entityAllList.push(entity);
  //         entityColorList[`${entity.alignmentPoint.x}-${entity.alignmentPoint.y}`] =
  //           entity.trueColor.clone();
  //       }
  //     });
  //   });
  //   emit('getAllEntity', entityList);
  // };

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

  const clearAllLine = (mxCAD: any) => {
    entityAllLineList.forEach((line: any) => {
      console.log('line', line);
      line.erase();
    });
    entityAllLineList.length = 0;
  };

  // 创建红色边框实体
  const createRedBorder = (entry: any, mxCAD: any) => {
    // 1. 获取实体的包围盒
    const bbox = entry.getBoundingBox();
    const distance = 5;
    const leftTop = new McGePoint3d(bbox.minPt.x - distance, bbox.maxPt.y + distance, 0);
    const rightTop = new McGePoint3d(bbox.maxPt.x + distance, bbox.maxPt.y + distance, 0);
    const leftBottom = new McGePoint3d(bbox.minPt.x - distance, bbox.minPt.y - distance, 0);
    const rightBottom = new McGePoint3d(bbox.maxPt.x + distance, bbox.minPt.y - distance, 0);

    const line = new McDbLine(leftTop.x, leftTop.y, 0, rightTop.x, rightTop.y, 0);
    line.isClosed = true;
    const line2 = new McDbLine(leftBottom.x, leftBottom.y, 0, rightBottom.x, rightBottom.y, 0);
    line2.isClosed = true;
    const line3 = new McDbLine(leftTop.x, leftTop.y, 0, leftBottom.x, leftBottom.y, 0);
    line3.isClosed = true;
    const line4 = new McDbLine(rightTop.x, rightTop.y, 0, rightBottom.x, rightBottom.y, 0);
    line4.isClosed = true;

    line.trueColor = new McCmColor(0, 0, 255);
    line2.trueColor = new McCmColor(0, 0, 255);
    line3.trueColor = new McCmColor(0, 0, 255);
    line4.trueColor = new McCmColor(0, 0, 255);
    const mcObjectId = mxCAD.drawEntity(line);
    const mcObjectId2 = mxCAD.drawEntity(line2);
    const mcObjectId3 = mxCAD.drawEntity(line3);
    const mcObjectId4 = mxCAD.drawEntity(line4);
    entityAllLineList.push(mcObjectId, mcObjectId2, mcObjectId3, mcObjectId4);
  };

  const showEntryByPosition = (entry: any) => {
    const aliginPoint = entry.alignmentPoint;
    if (aliginPoint === undefined) {
      return;
    }
    const currentMxCAD = mxCad.value.getMxCpp().App.getCurrentMxCAD();
    currentMxCAD.zoomAll();
    currentMxCAD.zoomCenter(aliginPoint.x, aliginPoint.y);
    currentMxCAD.zoomScale(9);

    // 重置所有实体颜色
    resetAllEntityColor();
    // 清除所有线
    clearAllLine(currentMxCAD);
    // 设置文字颜色
    const color = entry.trueColor.clone();
    color.setRGB(255, 0, 0);
    entry.trueColor = color;

    // 设置边框
    createRedBorder(entry, currentMxCAD);

    currentMxCAD.updateDisplay();
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
