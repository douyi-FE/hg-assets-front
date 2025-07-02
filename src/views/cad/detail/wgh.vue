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
          <a-col :span="6">
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
          <a-col :span="6">
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
          <a-col :span="6">
            <a-form-item label="资产业务点">
              <a-select
                allow-clear
                show-search
                placeholder="请选择资产业务点"
                v-model:value="searchForm.businessPoint"
                :options="businessPointOptions"
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
        <!-- <a-tooltip>
          <template #title>点击框选开始框选，右键结束框选</template>
          <a-button @click="handleSelectModeChange" :icon="h(InfoCircleFilled)"> 框选 </a-button>
        </a-tooltip> -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import {
    createMxCad,
    MxCADSelectionSet,
    McCmColor,
    McGePoint3d,
    McDbPolyline,
    McDbLine,
    McDbHatch,
    McGePoint3dArray,
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
  const lineColors = ref<any[]>([
    [41, 121, 255],
    [255, 214, 0],
    [0, 229, 255],
    [255, 145, 0],
    [105, 240, 174],
    [213, 0, 249],
    [255, 23, 68],
  ]);
  const searchForm = ref<any>({
    assetUseType: undefined,
    businessLine: undefined,
    businessPoint: undefined,
  });
  const emit = defineEmits([
    'selectEntityChange',
    'update:mxFileUrl',
    'clearCellTag',
    'showCellByTag',
    'showCell',
  ]);

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
  };

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

  const initSearchForm = () => {
    searchForm.value = {
      assetUseType: undefined,
      businessLine: undefined,
      businessPoint: undefined,
    };
  };

  const handleAssetUseTypeChange = (value: any) => {
    if (!value) {
      businessLineOptions.value = [];
      searchForm.value.businessLine = undefined;
      businessPointOptions.value = [];
      searchForm.value.businessPoint = undefined;
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
      return;
    }
    const { row, col, sheetName } = JSON.parse(value);
    const cellList = props.getAllCellByRowAndCol(sheetName, row, col);
    businessPointOptions.value = cellList;
  };

  const registerEvent = (mxCad: any) => {
    mxCad.on('selectChange', (ids: any[]) => {
      console.log('selectChange', ids);
      if (ids.length > 0) {
        const firstEntity: any = ids[0].getMcDbEntity();
        const entityHandle = firstEntity.getHandle();
        emit('selectEntityChange', {
          id: ids[0].id,
          handle: entityHandle,
        });
        showEntryByBox(firstEntity?.getBoundingBox());
        // 保存实体原本颜色
        entityColorMap[entityHandle]
          ? null
          : (entityColorMap[entityHandle] = firstEntity.trueColor.clone());
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

  // 设置初始实体颜色,用于恢复实体颜色
  const setInitEntityColor = (handles: string[]) => {
    handles.forEach((handle: string) => {
      const entity = entityAllMap[handle];
      if (entity) {
        entityColorMap[handle] ? null : (entityColorMap[handle] = entity.trueColor.clone());
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

  const showEntityByTag = (entites: any) => {
    if (!entites) {
      clearAllLine();
      resetAllEntityColor();
      message.error('未关联cad图纸');
      return;
    }
    if (Array.isArray(entites) && entites.length > 0) {
      if (entites.length === 1) {
        const entity = entityAllMap[entites[0].handle];
        showEntryByBox(entity?.getBoundingBox());
        // 清除所有边框
        clearAllLine();
        // 重置实体颜色
        entityColorMap[entity.getHandle()]
          ? null
          : (entityColorMap[entity.getHandle()] = entity.trueColor.clone());
        resetAllEntityColor();
        createRedText(entity, mxCad.value);
        // 设置边框
        createRedBorder(entity, mxCad.value);
        // 显示实体信息
        showEntityInfo(entity, entites[0].attach);
      } else {
        // 去重
        const tagList: any[] = [];
        entites.forEach((item: any) => {
          const { handle } = item;
          if (!tagList.find((item: any) => item.handle === handle)) {
            tagList.push(item);
          }
        });
        const entitys = tagList
          .map((item: any) => {
            return entityAllMap[item.handle];
          })
          .filter((entity) => entity);
        const bbox = getEntitysBbox(entitys);
        showEntryByBox(bbox);
        // createRedBorder(entitys[0], mxCad.value, bbox);
        // 绘制连接线
        drawConnectLine(entitys);
        // 重置实体颜色
        entitys.forEach((entity) => {
          entityColorMap[entity.getHandle()]
            ? null
            : (entityColorMap[entity.getHandle()] = entity.trueColor.clone());
        });
        resetAllEntityColor();
        entitys.forEach((entity) => {
          createRedText(entity, mxCad.value);
        });
      }
    }
  };

  // 线条绘制箭头
  const drawArrow = (line: any) => {
    const arrowLength = 20;
    const pt1 = line.endPoint;
    const pt2 = line.startPoint;
    // 方向向量: endPoint -> startPoint
    const vec = pt2.sub(pt1).normalize().mult(arrowLength);
    // 箭头基点: endPoint往startPoint方向退一个箭头长度
    const pt = pt1.clone().addvec(vec);
    // 法向量，构造箭头两边
    const _vec = vec
      .clone()
      .rotateBy(Math.PI / 2)
      .normalize()
      .mult(arrowLength / 8);
    const pt3 = pt.clone().addvec(_vec);
    const pt4 = pt.clone().subvec(_vec);
    const solid = new McDbHatch();
    solid.appendLoop(new McGePoint3dArray([pt1, pt3, pt4]));
    solid.trueColor = new McCmColor(255, 0, 0);
    return solid;
  };

  // 绘制线段中点左右两侧的两个空心箭头（底部不闭合）
  const drawArrowsAtLineCenter = (
    line: any,
    color: any,
    gap = 40,
    arrowLength = 20,
    angle = Math.PI / 4, // 默认45°
  ) => {
    const pt1 = line.startPoint;
    const pt2 = line.endPoint;

    // 线段方向
    const dir = pt2.clone().sub(pt1).normalize();
    // 中点
    const mid = pt1.clone().addvec(dir.clone().mult(pt2.clone().sub(pt1).length() / 2));
    // 两箭头顶点
    const halfGap = gap / 2;
    const arrowTip1 = mid.clone().subvec(dir.clone().mult(halfGap));
    const arrowTip2 = mid.clone().addvec(dir.clone().mult(halfGap));

    // 箭头两边点计算（开角可配置）
    function getArrowLines(tip: any, direction: any) {
      // 以开角angle，绕direction旋转
      // 构造两边向量
      const leftVec = direction
        .clone()
        .rotateBy(angle / 2)
        .normalize()
        .mult(arrowLength);
      const rightVec = direction
        .clone()
        .rotateBy(-angle / 2)
        .normalize()
        .mult(arrowLength);

      const ptLeft = tip.clone().subvec(leftVec);
      const ptRight = tip.clone().subvec(rightVec);

      // 画两边
      const polyline1 = new McDbPolyline();
      polyline1.addVertexAt(new McGePoint3d(tip.x, tip.y, 0));
      polyline1.addVertexAt(new McGePoint3d(ptLeft.x, ptLeft.y, 0));
      polyline1.constantWidth = 3;
      polyline1.trueColor = color;
      const polyline2 = new McDbPolyline();
      polyline2.addVertexAt(new McGePoint3d(tip.x, tip.y, 0));
      polyline2.addVertexAt(new McGePoint3d(ptRight.x, ptRight.y, 0));
      polyline2.constantWidth = 3;
      polyline2.trueColor = color;
      return [polyline1, polyline2];
    }

    // 两箭头都朝向 dir
    const arrows1 = getArrowLines(arrowTip1, dir);
    const arrows2 = getArrowLines(arrowTip2, dir);

    return [...arrows1, ...arrows2];
  };

  // 绘制连接线
  const drawConnectLine = (entitys: any[]) => {
    clearAllLine();
    resetAllEntityColor();
    mxCad.value.getMxCpp().App.getCurrentMxCAD().updateDisplay();
    if (entitys.length >= 2) {
      const distance = 5;
      const getPointDirection = (bbox1: any, bbox2: any) => {
        const center1 = new McGePoint3d(
          (bbox1.minPt.x + bbox1.maxPt.x) / 2,
          (bbox1.minPt.y + bbox1.maxPt.y) / 2,
          0,
        );
        const center2 = new McGePoint3d(
          (bbox2.minPt.x + bbox2.maxPt.x) / 2,
          (bbox2.minPt.y + bbox2.maxPt.y) / 2,
          0,
        );
        let direction = '';
        if (center1.x < center2.x && center1.y < center2.y) {
          direction = 'right-top';
        } else if (center1.x > center2.x && center1.y < center2.y) {
          direction = 'left-top';
        } else if (center1.x < center2.x && center1.y > center2.y) {
          direction = 'right-bottom';
        } else if (center1.x > center2.x && center1.y > center2.y) {
          direction = 'left-bottom';
        }
        return direction;
      };
      const points = entitys.map((entity, index) => {
        if (index === 0) {
          const bbox = entity.getBoundingBox();
          const nextBbox = entitys[index + 1].getBoundingBox();
          const direction = getPointDirection(bbox, nextBbox);
          if (direction === 'right-top' || direction === 'left-top') {
            return new McGePoint3d((bbox.minPt.x + bbox.maxPt.x) / 2, bbox.maxPt.y + distance, 0);
          } else if (direction === 'right-bottom' || direction === 'left-bottom') {
            return new McGePoint3d((bbox.minPt.x + bbox.maxPt.x) / 2, bbox.minPt.y - distance, 0);
          }
        } else if (index === entitys.length - 1) {
          const preBbox = entitys[index - 1].getBoundingBox();
          const bbox = entity.getBoundingBox();
          const direction = getPointDirection(preBbox, bbox);
          if (direction === 'right-top' || direction === 'left-top') {
            return new McGePoint3d((bbox.minPt.x + bbox.maxPt.x) / 2, bbox.minPt.y - distance, 0);
          } else if (direction === 'right-bottom' || direction === 'left-bottom') {
            return new McGePoint3d((bbox.minPt.x + bbox.maxPt.x) / 2, bbox.maxPt.y + distance, 0);
          }
        } else {
          const bbox = entity.getBoundingBox();
          return [
            new McGePoint3d((bbox.maxPt.x + bbox.minPt.x) / 2, bbox.maxPt.y + distance, 0),
            new McGePoint3d((bbox.maxPt.x + bbox.minPt.x) / 2, bbox.minPt.y - distance, 0),
          ];
        }
      });
      for (let i = 0; i < points.length - 1; i++) {
        let startPoint = points[i];
        let endPoint = points[i + 1];
        if (Array.isArray(startPoint)) {
          startPoint = startPoint[1];
        }
        if (Array.isArray(endPoint)) {
          endPoint = endPoint[0];
        }

        const color = new McCmColor(...lineColors.value[i % lineColors.value.length]);

        const polyline = new McDbPolyline();
        polyline.addVertexAt(new McGePoint3d(startPoint.x, startPoint.y, 0));
        polyline.addVertexAt(new McGePoint3d(endPoint.x, endPoint.y, 0));
        polyline.constantWidth = 3;
        polyline.trueColor = color;
        const polylineId = mxCad.value.drawEntity(polyline);
        entityAllLineList.push(polylineId);
        const line = new McDbLine(startPoint.x, startPoint.y, 0, endPoint.x, endPoint.y, 0);
        const arrows = drawArrowsAtLineCenter(line, color);
        arrows.forEach((item) => {
          const arrowId = mxCad.value.drawEntity(item);
          entityAllLineList.push(arrowId);
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
        // 保存实体原本颜色
        entitys.forEach((entity) => {
          entityColorMap[entity.getHandle()]
            ? null
            : (entityColorMap[entity.getHandle()] = entity.trueColor.clone());
        });
        // 重置实体颜色
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
    const { assetUseType, businessLine, businessPoint } = searchForm.value;
    let cellInfo: any = null;
    if (businessPoint) {
      cellInfo = JSON.parse(businessPoint);
      const { tag } = cellInfo;
      showEntityByTag(tag.entites);
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
    initSearchForm,
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
      overflow: hidden;
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
