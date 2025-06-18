<template>
  <div class="wgh-container">
    <div class="wgh-header">
      <a-form
        :model="searchForm"
        :label-col="{ span: 10 }"
        :wrapper-col="{ span: 14 }"
        layout="inline"
      >
        <a-row style="width: 100%">
          <a-col :span="5">
            <a-form-item label="资产使用性质">
              <a-select
                allow-clear
                show-search
                placeholder="请选择资产使用性质"
                v-model:value="searchForm.assetUseType"
                :options="assetUseTypeOptions"
                @change="handleAssetUseTypeChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="资产业务线">
              <a-select
                allow-clear
                show-search
                placeholder="请选择资产业务线"
                v-model:value="searchForm.businessLine"
                :options="businessLineOptions"
                @change="handleBusinessLineChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="资产业务点">
              <a-select
                allow-clear
                show-search
                placeholder="请选择资产业务点"
                v-model:value="searchForm.businessPoint"
                :options="businessPointOptions"
                @change="handleBusinessPointChange"
              />
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <a-form-item label="资产名称">
              <a-select
                allow-clear
                show-search
                placeholder="请选择资产名称"
                v-model:value="searchForm.assetName"
                :options="assetNameOptions"
              />
            </a-form-item>
          </a-col>
          <a-col :span="4" style="text-align: right">
            <a-button type="primary" @click="handleSearch" style="margin-right: 10px"
              >查询</a-button
            >
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="wgh-content">
      <canvas id="myCanvas" />
      <div class="wgh-tools" v-if="detialId !== '' && mode === 'edit'">
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
            :action="`${baseApiUrl}/api/tools/upload/dwg`"
            :showUploadList="false"
            @change="handleUploadChange"
          >
            <a-button type="primary">
              <upload-outlined />
              上传
            </a-button>
          </a-upload>
        </a-tooltip>
        <a-tooltip>
          <template #title>点击框选开始框选，右键结束框选</template>
          <a-button @click="handleSelectModeChange" :icon="h(InfoCircleFilled)"> 框选 </a-button>
        </a-tooltip>
      </div>
      <entity-info ref="entityInfoRef" class="entity-info" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, h } from 'vue';
  import { UploadOutlined, InfoCircleFilled } from '@ant-design/icons-vue';
  import { createMxCad, MxCADSelectionSet, McCmColor, McGePoint3d, McDbPolyline } from 'mxcad';
  import { message, type UploadChangeParam } from 'ant-design-vue';
  import EntityInfo from './entity-info.vue';
  import { useUserStore } from '@/store/modules/user';

  message.config({
    maxCount: 1,
  });

  const props = withDefaults(
    defineProps<{
      mxFileUrl: string;
      detialId: string;
      getClickCell?: Function;
      getCellInfoByHandle?: Function;
      getAllCellByRowAndCol?: Function;
      getTagListBySpan?: Function;
      bindCellTag?: Function;
      mode?: string;
    }>(),
    {
      mxFileUrl: '',
      detialId: '',
      getClickCell() {
        return null;
      },
      getCellInfoByHandle() {
        return undefined;
      },
      getAllCellByRowAndCol() {
        return [];
      },
      getTagListBySpan() {
        return [];
      },
      bindCellTag() {
        return null;
      },
      mode: 'edit',
    },
  );

  const baseApiUrl = import.meta.env.VITE_BASE_API_URL;
  const userStore = useUserStore();
  const token = userStore.token;
  const fileList = ref<any[]>([]);
  const mxCad = ref<any>(null);
  let entityColorMap: any = {};
  const entityAllMap: any = {};
  const entityAllLineList: any[] = [];
  const selectEntitys = ref<any[]>([]);
  const entityInfoRef = ref<any>(null);
  const assetUseTypeOptions = ref<any[]>([]);
  const businessLineOptions = ref<any[]>([]);
  const businessPointOptions = ref<any[]>([]);
  const assetNameOptions = ref<any[]>([]);
  const searchForm = ref<any>({
    assetUseType: undefined,
    businessLine: undefined,
    businessPoint: undefined,
    assetName: undefined,
  });
  const emit = defineEmits([
    'selectEntityChange',
    'update:mxFileUrl',
    'clearCellTag',
    'showCellByTag',
    'showCell',
  ]);

  const showEntityInfo = (entity: any, info: any = null) => {
    if (info) {
      entityInfoRef.value.showContent(info);
      return;
    }
    if (!entity) {
      return;
    }
    const cell = props.getCellInfoByHandle(entity.getHandle());
    if (cell) {
      const { attach = {} } = cell;
      const { name, price, time = [] } = attach;
      entityInfoRef.value.showContent({
        name,
        price,
        time,
      });
    } else {
      entityInfoRef.value.showContent({
        name: '',
        price: '',
        time: [],
      });
    }
  };

  const setSearchOptions = (data: any = {}) => {
    assetUseTypeOptions.value = data;
  };

  const handleAssetUseTypeChange = (value: any) => {
    if (!value) {
      businessLineOptions.value = [];
      searchForm.value.businessLine = undefined;
      businessPointOptions.value = [];
      searchForm.value.businessPoint = undefined;
      assetNameOptions.value = [];
      searchForm.value.assetName = undefined;
      return;
    }
    const { row, col, sheetName } = JSON.parse(value);
    const cellList = props.getAllCellByRowAndCol(sheetName, row, col);
    businessLineOptions.value = cellList;
  };

  const handleBusinessLineChange = (value: any) => {
    if (!value) {
      businessPointOptions.value = [];
      searchForm.value.businessPoint = undefined;
      assetNameOptions.value = [];
      searchForm.value.assetName = undefined;
      return;
    }
    const { row, col, sheetName } = JSON.parse(value);
    const cellList = props.getAllCellByRowAndCol(sheetName, row, col);
    businessPointOptions.value = cellList;
  };

  const handleBusinessPointChange = (value: any) => {
    if (!value) {
      assetNameOptions.value = [];
      searchForm.value.assetName = undefined;
      return;
    }
    const { row, col, sheetName } = JSON.parse(value);
    const cellList = props.getAllCellByRowAndCol(sheetName, row, col);
    assetNameOptions.value = cellList;
  };

  const registerEvent = (mxCad: any) => {
    mxCad.on('selectChange', (ids: any[]) => {
      if (ids.length > 0) {
        const firstEntity: any = ids[0].getMcDbEntity();
        const entityHandle = firstEntity.getHandle();
        emit('selectEntityChange', {
          id: ids[0].id,
          handle: entityHandle,
        });
        showEntryByBox(firstEntity?.getBoundingBox());
        // 重置实体颜色
        resetAllEntityColor();
        createRedText(firstEntity, mxCad);
        createRedBorder(firstEntity, mxCad);
        // 显示实体信息
        showEntityInfo(firstEntity);
        selectEntitys.value = [
          {
            id: ids[0].id,
            handle: entityHandle,
            objectName: firstEntity.objectName,
            textString: firstEntity.textString,
            layer: firstEntity.layer,
          },
        ];
      } else {
        selectEntitys.value = [];
      }
    });
  };

  const getAllEntity = () => {
    // 创建选择集实例
    const selectionSet = new MxCADSelectionSet();
    // 选择所有图形元素
    selectionSet.allSelect();
    const ids = selectionSet.getIds();
    // 遍历并获取所有实体
    ids.forEach((id: any) => {
      const entity = id.getMcDbEntity();
      const handle = entity.getHandle();
      entityAllMap[handle] = entity;
    });
  };

  const resetAllEntityColor = () => {
    Object.keys(entityColorMap).forEach((key: any) => {
      const color = entityColorMap[key].clone();
      entityColorMap[key] = color;
      const entity = entityAllMap[key];
      if (entity) {
        entity.trueColor = color;
      }
    });
    mxCad.value.getMxCpp().App.getCurrentMxCAD().updateDisplay();
  };

  const clearAllLine = () => {
    entityAllLineList.forEach((line: any) => {
      line.erase();
    });
    entityAllLineList.length = 0;
  };

  // 设置初始实体颜色,用于恢复实体颜色
  const setInitEntityColor = (handles: string[]) => {
    handles.forEach((handle: string) => {
      const entity = entityAllMap[handle];
      if (entity) {
        entityColorMap[handle] = entity.trueColor.clone();
      }
    });
  };

  // 创建红色字体
  const createRedText = (entity: any, mxCAD: any) => {
    if (!entity) {
      return;
    }
    const currentMxCAD = mxCAD.getMxCpp().App.getCurrentMxCAD();
    // 清除当前选择
    currentMxCAD.mxdraw.clearMxCurrentSelect();
    // 设置文字颜色
    const color = entity.trueColor.clone();
    color.setRGB(255, 0, 0);
    entity.trueColor = color;
    currentMxCAD.updateDisplay();
  };

  // 创建红色边框实体
  const createRedBorder = (entry: any, mxCAD: any, bbox: any = null) => {
    if (!entry) {
      return;
    }
    clearAllLine();
    if (!bbox) {
      bbox = entry.getBoundingBox();
    }
    const pl = new McDbPolyline();
    pl.constantWidth = 3;
    const distance = 10;
    const pt1 = new McGePoint3d(bbox.minPt.x - distance, bbox.minPt.y - distance, 0);
    const pt2 = new McGePoint3d(bbox.minPt.x - distance, bbox.maxPt.y + distance, 0);
    const pt3 = new McGePoint3d(bbox.maxPt.x + distance, bbox.maxPt.y + distance, 0);
    const pt4 = new McGePoint3d(bbox.maxPt.x + distance, bbox.minPt.y - distance, 0);
    pl.addVertexAt(pt1);
    pl.addVertexAt(pt2);
    pl.addVertexAt(pt3);
    pl.addVertexAt(pt4);
    pl.isClosed = true;
    pl.trueColor = new McCmColor(255, 0, 0);
    const mcObjectId = mxCAD.drawEntity(pl);
    entityAllLineList.push(mcObjectId);
  };

  // 显示实体位置
  const showEntryByBox = (bbox: any) => {
    if (!bbox) {
      message.error('实体没有包围盒，无法联动显示');
      return;
    }
    const aliginPoint = new McGePoint3d(
      (bbox.minPt.x + bbox.maxPt.x) / 2,
      (bbox.minPt.y + bbox.maxPt.y) / 2,
      0,
    );
    const currentMxCAD = mxCad.value.getMxCpp().App.getCurrentMxCAD();
    currentMxCAD.zoomAll();
    currentMxCAD.zoomCenter(aliginPoint.x, aliginPoint.y);

    // 设置缩放比例
    const viewCoord = currentMxCAD.getViewCADCoord();
    const viewHeight = viewCoord.pt1.distanceTo(viewCoord.pt2);
    const viewWidth = viewCoord.pt1.distanceTo(viewCoord.pt4);
    const entityWidth = bbox.maxPt.x - bbox.minPt.x;
    const entityHeight = bbox.maxPt.y - bbox.minPt.y;
    let targetScale = 0;
    if (entityWidth > entityHeight) {
      targetScale = (viewWidth * 0.5) / entityWidth;
    } else {
      targetScale = (viewHeight * 0.5) / entityHeight;
    }
    currentMxCAD.zoomScale(targetScale);
    currentMxCAD.updateDisplay();
  };

  const getEntitysBbox = (entitys: any[]) => {
    const minPts: any[] = [];
    const maxPts: any[] = [];
    entitys
      .filter((entity) => entity?.getBoundingBox())
      .forEach((entity) => {
        const bbox = entity.getBoundingBox();
        minPts.push(bbox.minPt);
        maxPts.push(bbox.maxPt);
      });
    const minPt = new McGePoint3d(
      Math.min(...minPts.map((pt) => pt.x)),
      Math.min(...minPts.map((pt) => pt.y)),
      0,
    );
    const maxPt = new McGePoint3d(
      Math.max(...maxPts.map((pt) => pt.x)),
      Math.max(...maxPts.map((pt) => pt.y)),
      0,
    );
    const bbox = {
      minPt,
      maxPt,
      rect: true,
    };
    return bbox;
  };

  const showEntityByTag = (tag: any) => {
    if (!tag) {
      return;
    }
    if (Array.isArray(tag) && tag.length > 0) {
      if (tag.length === 1) {
        const entity = entityAllMap[tag[0].handle];
        showEntryByBox(entity?.getBoundingBox());
        // 清除所有边框
        clearAllLine();
        // 重置实体颜色
        resetAllEntityColor();
        createRedText(entity, mxCad.value);
        // 设置边框
        createRedBorder(entity, mxCad.value);
        // 显示实体信息
        showEntityInfo(entity, tag[0].attach);
      } else {
        const entitys = tag
          .map((item: any) => {
            return entityAllMap[item.handle];
          })
          .filter((entity) => entity);
        const bbox = getEntitysBbox(entitys);
        showEntryByBox(bbox);
        createRedBorder(entitys[0], mxCad.value, bbox);
        // 重置实体颜色
        resetAllEntityColor();
        entitys.forEach((entity) => {
          createRedText(entity, mxCad.value);
        });
      }
    }
  };

  // 切换选择模式
  const handleSelectModeChange = async () => {
    const ss = new MxCADSelectionSet();
    ss.isWhileSelect = true;
    ss.isSelectHighlight = true;
    ss.userSelect('框选需要的对象').then((is) => {
      if (is) {
        const ids = ss.getIds();
        const entitys = ids.map((id) => {
          return id.getMcDbEntity();
        });
        const bbox = getEntitysBbox(entitys);
        createRedBorder(entitys[0], mxCad.value, bbox);
        resetAllEntityColor();
        selectEntitys.value = entitys.map((entity) => {
          createRedText(entity, mxCad.value);
          return {
            id: entity.id,
            handle: entity.getHandle(),
            objectName: entity.objectName,
            textString: entity.textString,
            layer: entity.layer,
          };
        });
      }
    });
  };

  const getSelectEntitys = () => {
    return selectEntitys.value;
  };

  const handleUploadChange = (info: UploadChangeParam) => {
    if (info.file.status !== 'uploading') {
      message.loading(`${info.file.name} 上传中...`);
    }
    if (info.file.status === 'done') {
      const { response } = info.file;
      if (response.code === 200) {
        emit('update:mxFileUrl', response.data.filename);
        emit('clearCellTag');
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
        getAllEntity();
      },
    }).then((mxCad: any) => {
      return mxCad;
    });
  };

  const handleSearch = () => {
    const { assetUseType, businessLine, businessPoint, assetName } = searchForm.value;
    let cellInfo: any = null;
    if (assetName) {
      cellInfo = JSON.parse(assetName);
      const { tag } = cellInfo;
      showEntityByTag(tag);
    } else if (businessPoint) {
      cellInfo = JSON.parse(businessPoint);
      const { row, col, sheetName } = cellInfo;
      const list: any[] = [];
      props.getTagListBySpan(sheetName, row, col, list);
      if (list.length) {
        showEntityByTag(list);
      } else {
        clearAllLine();
        resetAllEntityColor();
        message.error(`未关联cad图纸`);
      }
    } else if (businessLine) {
      cellInfo = JSON.parse(businessLine);
      const { row, col, sheetName } = cellInfo;
      const list: any[] = [];
      props.getTagListBySpan(sheetName, row, col, list);
      if (list.length) {
        showEntityByTag(list);
      } else {
        clearAllLine();
        resetAllEntityColor();
        message.error(`未关联cad图纸`);
      }
    } else if (assetUseType) {
      cellInfo = JSON.parse(assetUseType);
      const { row, col, sheetName } = cellInfo;
      const list: any[] = [];
      props.getTagListBySpan(sheetName, row, col, list);
      if (list.length) {
        showEntityByTag(list);
      } else {
        clearAllLine();
        resetAllEntityColor();
        message.error(`未关联cad图纸`);
      }
    } else {
      clearAllLine();
      resetAllEntityColor();
      message.error(`请选择查询条件`);
    }
    if (cellInfo) {
      const { row, col, sheetName } = cellInfo;
      emit('showCell', sheetName, row, col);
    }
  };

  watch(
    () => props.mxFileUrl,
    async () => {
      mxCad.value = await renderCad();
    },
    {
      immediate: true,
    },
  );

  watch(
    () => selectEntitys.value,
    () => {
      if (selectEntitys.value.length > 0) {
        emit('showCellByTag', selectEntitys.value[0]);
      }
    },
  );

  defineExpose({
    setInitEntityColor,
    showEntityByTag,
    getSelectEntitys,
    resetAllEntityColor,
    clearAllLine,
    setSearchOptions,
  });
</script>

<style scoped lang="less">
  .wgh-container {
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;

    .wgh-content {
      position: relative;
      flex: 1;
      overflow: auto;
    }

    .wgh-header {
      height: 40px;
    }
    .wgh-tools {
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
    .entity-info {
      position: absolute;
      top: 10px;
      right: 20px;
      z-index: 99;
    }
  }
</style>
