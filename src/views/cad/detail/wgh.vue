<template>
  <div class="wgh-container">
    <div class="wgh-header" v-if="detialId !== ''">
      <!-- <a-tooltip>
        <template #title>点击框选开始框选，右键结束框选</template>
        <a-button type="primary" @click="handleSelectModeChange" :icon="h(InfoCircleFilled)">
          框选
        </a-button>
      </a-tooltip> -->
      <a-tooltip>
        <template #title>点击上传可上传图纸</template>
        <a-upload
          v-model:file-list="fileList"
          name="file"
          :headers="{
            Authorization: `Bearer ${token}`,
            'X-Transfer-Mode': 'cad',
          }"
          accept=".dwg,.mxweb"
          action="/api/api/filestorage/upload"
          :showUploadList="false"
          @change="handleUploadChange"
        >
          <a-button>
            <upload-outlined />
            上传
          </a-button>
        </a-upload>
      </a-tooltip>
    </div>
    <canvas id="myCanvas" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import {
    createMxCad,
    MxCADResbuf,
    MxCADSelectionSet,
    McDbLine,
    McCmColor,
    McGePoint3d,
  } from 'mxcad';
  import { message, type UploadChangeParam } from 'ant-design-vue';
  import { useUserStore } from '@/store/modules/user';
  message.config({
    maxCount: 1,
  });

  const props = withDefaults(
    defineProps<{
      mxFileUrl: string;
      detialId: string;
      getClickCell?: Function;
      bindCellTag?: Function;
    }>(),
    {
      mxFileUrl: '',
      detialId: '',
      getClickCell() {
        return null;
      },
      bindCellTag() {
        return null;
      },
    },
  );

  const userStore = useUserStore();
  const token = userStore.token;
  const fileList = ref<any[]>([]);
  const mxCad = ref<any>(null);
  const entityColorList: any = {};
  const entityAllList: any[] = [];
  const entityAllLineList: any[] = [];
  let selectEntity: any = null;
  const emit = defineEmits(['selectEntityChange', 'update:mxFileUrl']);

  const registerEvent = (mxCad: any) => {
    mxCad.on('selectChange', (ids: any[]) => {
      if (ids.length > 0) {
        const firstEntity: any = ids[0].getMcDbEntity();
        const entityHandle = firstEntity.getHandle();
        emit('selectEntityChange', {
          id: ids[0].id,
          handle: entityHandle,
        });
        showEntryByPosition(firstEntity);
        selectEntity = {
          id: ids[0].id,
          handle: entityHandle,
        };
      }
    });
  };

  const getAllEntity = () => {
    const entityList: any[] = [];
    // 创建选择集实例
    const selectionSet = new MxCADSelectionSet();
    const filter = new MxCADResbuf();
    // 设置过滤器：仅选择文字和直线
    filter.AddMcDbEntityTypes('TEXT');
    // 选择所有图形元素
    selectionSet.allSelect();
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
  };

  const getEntryByHandle = (handle: any) => {
    // 创建选择集实例
    const selectionSet = new MxCADSelectionSet();
    // 选择所有图形元素
    selectionSet.allSelect();
    const ids = selectionSet.getIds();
    const id = ids.find((id: any) => id.getMcDbEntity().getHandle() === handle);
    if (id) {
      return id.getMcDbEntity();
    }
    return null;
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

  const showEntryByPosition = (entity: any) => {
    const objectName = entity.objectName;
    // console.log('objectName', objectName, entity);
    let aliginPoint: any = null;
    switch (objectName) {
      case 'McDbText':
        aliginPoint = entity.alignmentPoint;
        break;
      case 'McDbLine':
        const endPoint = entity.endPoint;
        const startPoint = entity.startPoint;
        aliginPoint = new McGePoint3d(
          (endPoint.x + startPoint.x) / 2,
          (endPoint.y + startPoint.y) / 2,
          0,
        );
        break;
      case 'McDbProxyEntity':
      case 'McDbBlockReference':
        const bbox = entity.getBoundingBox();
        const minPoint = bbox.minPt;
        const maxPoint = bbox.maxPt;
        aliginPoint = new McGePoint3d(
          (minPoint.x + maxPoint.x) / 2,
          (minPoint.y + maxPoint.y) / 2,
          0,
        );
        break;
      case 'McDbPolyline':
        const startPt = entity.getStartPoint();
        const endPt = entity.getEndPoint();
        aliginPoint = new McGePoint3d((startPt.x + endPt.x) / 2, (startPt.y + endPt.y) / 2, 0);
        break;
      case 'McDbArc':
      case 'McDbCircle':
        aliginPoint = entity.center;
        break;
      default:
        message.error('不支持的实体类型');
        break;
    }
    if (aliginPoint === null) {
      return;
    }
    const currentMxCAD = mxCad.value.getMxCpp().App.getCurrentMxCAD();
    currentMxCAD.zoomAll();
    currentMxCAD.zoomCenter(aliginPoint.x, aliginPoint.y);
    currentMxCAD.zoomScale(20);

    // 清除当前选择
    currentMxCAD.mxdraw.clearMxCurrentSelect();
    // 重置所有实体颜色
    resetAllEntityColor();
    // 清除所有线
    clearAllLine(currentMxCAD);
    // 设置文字颜色
    const color = entity.trueColor.clone();
    color.setRGB(255, 0, 0);
    entity.trueColor = color;
    // 设置边框
    createRedBorder(entity, currentMxCAD);
    currentMxCAD.updateDisplay();
  };

  const showEntityById = (tag: any) => {
    const entity = getEntryByHandle(tag.handle);
    showEntryByPosition(entity);
  };

  // 切换选择模式
  const handleSelectModeChange = async () => {
    const ss = new MxCADSelectionSet();
    ss.isWhileSelect = true;
    ss.isSelectHighlight = true;
    ss.userSelect('框选需要的对象').then((is) => {
      if (is) {
        ss.getIds();
        ss.forEach((id) => {
          let ent = id.getMcDbEntity();
          if (!ent) return;
          console.log(ent);
        });
      }
    });
  };

  const getSelectEntity = () => {
    return selectEntity;
  };

  const handleUploadChange = (info: UploadChangeParam) => {
    if (info.file.status !== 'uploading') {
      message.loading(`${info.file.name} 上传中...`);
    }
    if (info.file.status === 'done') {
      const { response } = info.file;
      if (response.code === 200) {
        console.log('response', response);
        emit('update:mxFileUrl', response.data.filename);
        message.success(`${info.file.name} 上传成功.`);
      } else {
        message.error(`${info.file.name} 上传失败.`);
      }
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} 上传失败.`);
    }
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
        // getAllEntityV2();
      },
    }).then((mxCad: any) => {
      return mxCad;
    });
  };

  watch(
    () => props.mxFileUrl,
    async () => {
      console.log('props.mxFileUrl', props.mxFileUrl);
      mxCad.value = await renderCad();
    },
    {
      immediate: true,
    },
  );

  defineExpose({
    showEntryByPosition,
    showEntityById,
    getSelectEntity,
  });
</script>

<style scoped lang="less">
  .wgh-container {
    height: 100%;
    position: relative;
    overflow: hidden;
    .wgh-header {
      position: absolute;
      top: 10px;
      left: 10px;
      padding: 5px;
      background-color: #fff;
      z-index: 1000;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }
</style>
