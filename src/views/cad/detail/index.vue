<template>
  <div class="cad-container">
    <div class="excel-book__list">
      <div class="excel-book__list-header">
        <a-space v-if="mode === 'edit'">
          <a-button @click="openExcelFile" type="primary">打开文件</a-button>
          <a-button @click="linkCad" :disabled="isLinkCad">关联cad</a-button>
          <a-button @click="unlinkCad" :disabled="isLinkCad">解除关联</a-button>
          <upload-info @uploadSuccess="uploadSuccess" />
        </a-space>
      </div>
      <div id="excel_book_content" class="excel-book__content" />
      <assets-list
        :mode="mode"
        class="assets-list__container"
        v-model:open="assetsListOpen"
        ref="assetsListRef"
        @update:cell-tag="updateCellTag"
      />
    </div>
    <wgh
      v-if="mxFileUrl !== ''"
      class="excel-book__cad"
      ref="wghRef"
      :mode="mode"
      :mx-file-url="mxFileUrl"
      :detial-id="detialId"
      :get-click-cell="getClickCell"
      :get-cell-info-by-handle="getCellInfoByHandle"
      :get-all-cell-by-row-and-col="getAllCellByRowAndCol"
      :get-tag-list-by-span="getTagListBySpan"
      @update:mx-file-url="updateMxFileUrl"
      @selectEntityChange="selectEntityChange"
      @clearCellTag="clearCellTag"
      @showCellByTag="showCellByTag"
      @showCell="showCell"
    />
    <a-empty v-else class="wgh-empty">
      <template #description>
        <span> 请上传图纸 </span>
      </template>
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
        @change="handleChange"
      >
        <a-button>
          <upload-outlined />
          上传图纸
        </a-button>
      </a-upload>
    </a-empty>
    <CellDialog ref="cellDialogRef" @update:tag="setCellTag" :mode="mode" />
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { type UploadChangeParam, message } from 'ant-design-vue';
  import wgh from '../detail/wgh.vue';
  import { HighlightTagCellType, tagList } from './highlightTagCellType';
  import CellDialog from './cell-dialog.vue';
  import UploadInfo from './upload-info.vue';
  import AssetsList from './assets-list.vue';
  import { getCellByText } from './utils';
  import { assetColText, filterFirstColText } from './config';
  import { useUserStore } from '@/store/modules/user';
  import { getCadDetail } from '@/api/backend/api/cad';
  import { base64ToArrayBuffer } from '@/components/basic/ejs-design/resource/commonFunctions';

  const props = defineProps({
    mode: {
      type: String,
      default: 'edit',
    },
    detialId: {
      type: String,
      default: '',
    },
    mxFileUrl: {
      type: String,
      default: '',
    },
    isShowExcelFile: {
      type: Boolean,
      default: false,
    },
  });
  const emits = defineEmits(['update:mxFileUrl']);
  message.config({
    maxCount: 1,
  });
  const baseApiUrl = import.meta.env.VITE_BASE_API_URL;
  const userStore = useUserStore();
  const token = userStore.token;
  let spread: any = null;
  const wghRef = ref<any>(null);
  const selectedEntity = ref<any>(null);
  const fileList = ref<any[]>([]);
  const cellDialogRef = ref<any>(null);
  const assetsListRef = ref<any>(null);
  const selectEntityHandles = ref<string[]>([]);
  const isLinkCad = ref<boolean>(false);
  const assetCell = ref<any>(null);
  const assetsListOpen = ref<boolean>(false);
  // 更新图纸url
  const updateMxFileUrl = (url: string) => {
    emits('update:mxFileUrl', url);
  };

  // 上传图纸
  const handleChange = (info: UploadChangeParam) => {
    if (info.file.status !== 'uploading') {
      message.loading({
        content: `${info.file.name} 上传中...`,
      });
    }
    if (info.file.status === 'done') {
      const { response } = info.file;
      if (response.code === 200) {
        emits('update:mxFileUrl', response.data.filename);
        message.success({
          content: `${info.file.name} 上传成功.`,
        });
        // 清除单元格tag
        clearCellTag();
      } else {
        message.error({
          content: `${info.file.name} 上传失败.`,
        });
      }
    } else if (info.file.status === 'error') {
      message.error({
        content: `${info.file.name} 上传失败.`,
      });
    }
  };

  // 选择cad图元素
  const selectEntityChange = (entity: any) => {
    if (!entity.id) {
      return;
    }
    selectedEntity.value = entity;
  };

  // 设置单元格tag
  const setCellTag = (entites: any, cell: { sheetName: string; row: number; col: number }) => {
    let sheet: any = null;
    if (cell.sheetName) {
      sheet = spread.getSheetFromName(cell.sheetName);
    } else {
      sheet = spread.getActiveSheet();
    }
    const tag = sheet.getTag(cell.row, cell.col);
    tag.entites = entites;
    sheet.setTag(cell.row, cell.col, tag);
    sheet.repaint();
  };

  // 根据handle获取单元格信息
  const getCellInfoByHandle = (handle: string): object | undefined => {
    const cell = tagList.find((item) => {
      return item.tag.entites
        .map((item) => {
          return item.handle;
        })
        .find((item) => {
          return handle === item;
        });
    });
    if (cell) {
      return cell.tag.entites.find((item) => {
        return item.handle === handle;
      });
    }
    return undefined;
  };

  // 根据tag显示单元格
  const showCellByTag = (tag: any) => {
    selectEntityHandles.value = [tag.handle];
    const cell = tagList.find((item) => {
      return item.tag.entites
        .map((item) => {
          return item.handle;
        })
        .find((item) => {
          return tag.handle === item;
        });
    });
    if (cell) {
      const { row, col, sheetName } = cell;
      spread.setActiveSheet(sheetName);
      const sheet = spread.getSheetFromName(sheetName);
      sheet.showCell(
        row,
        col,
        GC.Spread.Sheets.VerticalPosition.top,
        GC.Spread.Sheets.HorizontalPosition.left,
      );
      sheet.setActiveCell(row, col);
    }
  };

  // 依据sheet、row、col显示单元格
  const showCell = (sheetName: string, row: number, col: number) => {
    if (!spread) {
      return;
    }
    spread.setActiveSheet(sheetName);
    const sheet = spread.getSheetFromName(sheetName);
    sheet.showCell(
      row,
      col,
      GC.Spread.Sheets.VerticalPosition.top,
      GC.Spread.Sheets.HorizontalPosition.left,
    );
    sheet.setActiveCell(row, col);
  };

  // 获取ExcelEjs
  const getExcelEjs = function () {
    const wb = GC.Spread.Sheets.findControl('excel_book_content');
    return new Promise((resolve, reject) => {
      wb.save((blob) => {
        // 将 blob 转为 Base64
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
          const base64data = (reader.result as string) || '';
          // base64data 通常带有前缀，如 "data:application/octet-stream;base64,XXXXXXXX"
          // 如果后端只想存储纯粹的 base64，去掉前缀即可：
          const pureBase64 = base64data.split(',')[1];
          resolve(pureBase64);
        };
      });
    });
  };

  // 清除单元格tag
  const clearCellTag = () => {
    if (!spread) {
      return;
    }
    const sheet = spread.getActiveSheet();
    tagList.forEach((item) => {
      const tag = sheet.getTag(item.row, item.col);
      if (tag) {
        tag.entites = null;
        sheet.setTag(item.row, item.col, tag);
        sheet.setStyle(item.row, item.col, null);
      }
    });
    tagList.length = 0;
    sheet.repaint();
  };

  // 获取数据
  const getData = async function () {
    const excelEjs = await getExcelEjs();
    return {
      detailId: props.detialId,
      excelEjs,
      cadFileUrl: props.mxFileUrl,
    };
  };

  // 上传成功
  const uploadSuccess = (cellInfo: any) => {
    const sheet = spread.getActiveSheet();
    const rowCount = sheet.getRowCount();
    const colCount = sheet.getColumnCount();
    let res: any = null;
    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const cellValue = sheet.getValue(row, col);
        if (cellValue === assetColText) {
          res = { sheetName: sheet.name(), row: row, col: col, rowCount };
          break;
        }
      }
    }
    if (!res) {
      message.error('未找到对应单元格');
      return;
    }
    cellInfo.forEach((item: any) => {
      const { row, sheetName, attach } = item;
      // const { name, time, price } = attach;
      const sheet = spread.getSheetFromName(sheetName);
      let tag = sheet.getTag(row, res.col);
      if (tag.entites && tag.entites.length) {
        tag.entites = tag.entites.map((item: any) => {
          item.attach = attach;
          return item;
        });
      } else {
        tag.entites = [
          {
            attach,
          },
        ];
      }
      sheet.setTag(row, res.col, tag);
    });
  };

  // 关联cad图纸
  const linkCad = () => {
    if (!spread) {
      return;
    }
    const sheet = spread.getActiveSheet();
    const { col, row } = getClickCell() || {};
    if (!col || !row) {
      message.error('请先选择单元格');
      return;
    }
    const selectEntitys = wghRef.value.getSelectEntitys();
    if (!selectEntitys.length) {
      message.error('请先选择cad图元素');
      return;
    }
    const tag = sheet.getTag(row, col) || {};
    tag.entites = selectEntitys.map((item) => {
      return {
        id: item.id,
        handle: item.handle,
      };
    });
    sheet.setTag(row, col, tag);
    sheet.repaint();
    message.info(`关联成功`);
  };

  // 解除关联cad图纸
  const unlinkCad = () => {
    const { col, row } = getClickCell() || {};
    if (!col || !row) {
      message.error('请先选择单元格');
      return;
    }
    const sheet = spread.getActiveSheet();
    const tag = sheet.getTag(row, col);
    tag.entites = null;
    sheet.setTag(row, col, tag);
    sheet.setStyle(row, col, null);
    wghRef.value.clearAllLine();
    wghRef.value.resetAllEntityColor();
    message.info('解除关联成功');
  };

  // 根据值获取单元格
  const getAllCellByValue = (value: string): any[] => {
    if (!spread) {
      return [];
    }
    let res: any = null;
    const allRowValue: any[] = [];
    const sheet = spread.getActiveSheet();
    const rowCount = sheet.getRowCount();
    const colCount = sheet.getColumnCount();

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const cellValue = sheet.getValue(row, col);
        if (cellValue === value) {
          res = { sheetName: sheet.name(), row: row, col: col, rowCount };
          break;
        }
      }
    }

    if (res) {
      for (let i = res.row + 1; i < rowCount; i++) {
        const cellValue = sheet.getValue(i, res.col);
        cellValue &&
          !allRowValue.find((item) => item.value === cellValue) &&
          allRowValue.push({
            sheetName: sheet.name(),
            row: i,
            col: res.col,
            label: cellValue,
            value: JSON.stringify({
              col: res.col,
              row: i,
              sheetName: sheet.name(),
            }),
          });
      }
    }
    return allRowValue;
  };

  const getAllCellByRowAndCol = (sheetName: string, row: number, col: number): any[] => {
    if (!spread) {
      return [];
    }
    const sheet = spread.getSheetFromName(sheetName);
    let span = sheet.getSpan(row, col);
    const list: any[] = [];
    if (span) {
      let nextCol = span.col + span.colCount;
      for (let spanRow = span.row; spanRow < span.row + span.rowCount; spanRow++) {
        const value = sheet.getValue(spanRow, nextCol);
        const tag = sheet.getTag(spanRow, nextCol) || [];
        if (value) {
          list.push({
            row: spanRow,
            col: nextCol,
            sheetName: sheet.name(),
            value: JSON.stringify({
              tag,
              col: nextCol,
              row: spanRow,
              sheetName: sheet.name(),
            }),
            label: value,
          });
        }
      }
    }
    return list;
  };

  // 获取点击的单元格
  const getClickCell = () => {
    if (!spread) {
      return null;
    }
    const sheet = spread.getActiveSheet();
    const col = sheet.getActiveColumnIndex();
    const row = sheet.getActiveRowIndex();
    return { col, row };
  };

  // 设置单元格详情按钮
  const setCellDetailButton = () => {
    tagList.forEach((item) => {
      const { row, col, sheetName } = item;
      const sheet = spread.getSheetFromName(sheetName);
      const cell = sheet.getCell(row, col);
      const tag = sheet.getTag(row, col);
      if (props.mode === 'view') {
        cell.cellButtons([
          {
            caption: '列表',
            captionAlign: GC.Spread.Sheets.CaptionAlignment.right,
            imageType: GC.Spread.Sheets.ButtonImageType.collapse,
            visibility: GC.Spread.Sheets.ButtonVisibility.onSelected,
            command: (sheet, row, col, option) => {
              assetsListOpen.value = true;
              assetsListRef.value.setData({
                row,
                col,
                sheetName: sheet.name(),
                tag,
              });
            },
          },
        ]);
      } else {
        cell.cellButtons([
          {
            caption: '列表',
            captionAlign: GC.Spread.Sheets.CaptionAlignment.right,
            imageType: GC.Spread.Sheets.ButtonImageType.collapse,
            visibility: GC.Spread.Sheets.ButtonVisibility.onSelected,
            command: (sheet, row, col, option) => {
              assetsListOpen.value = true;
              assetsListRef.value.setData({
                row,
                col,
                sheetName: sheet.name(),
                tag,
              });
              // cellDialogRef.value.show(
              //   item,
              //   selectEntityHandles.value.length > 0
              //     ? selectEntityHandles.value
              //     : tag.map((item) => item.handle),
              // );
            },
          },
        ]);
      }
      sheet.repaint();
    });
  };

  const updateCellTag = (data: any) => {
    const { row, col, sheetName, childs } = data;
    const sheet = spread.getSheetFromName(sheetName);
    const tag = sheet.getTag(row, col);
    if (tag) {
      tag.childs = childs;
      sheet.setTag(row, col, tag);
    }
    sheet.repaint();
    message.info('保存成功');
    assetsListRef.value.close();
  };

  const setSearchOptions = () => {
    const businessLineList = getAllCellByValue(filterFirstColText);
    wghRef.value.setSearchOptions(businessLineList);
  };

  const getTagListBySpan = (sheetName: string, row: number, col: number, list: any[]) => {
    const sheet = spread.getSheetFromName(sheetName);
    const span = sheet.getSpan(row, col);
    if (span) {
      let nextCol = span.col + span.colCount;
      for (let spanRow = span.row; spanRow < span.row + span.rowCount; spanRow++) {
        const tag = sheet.getTag(spanRow, nextCol);
        if (tag && tag.entites && tag.entites.length) {
          list.push(...(Array.isArray(tag.entites) ? tag.entites : [tag.entites]));
        }
        getTagListBySpan(sheetName, spanRow, nextCol, list);
      }
    }
  };

  // 绑定单元格点击事件
  const bindSpreadEvent = function () {
    if (spread !== null) {
      var spreadNS = GC.Spread.Sheets;
      // 单击事件
      spread.bind(spreadNS.Events.CellClick, function (e, args) {
        try {
          const { col, row } = args;
          const sheet = spread.getActiveSheet();
          const tag = sheet.getTag(row, col);
          if (
            assetCell.value &&
            assetCell.value.sheetName === sheet.name() &&
            assetCell.value.col === col
          ) {
            isLinkCad.value = false;
          } else {
            isLinkCad.value = true;
          }
          if (tag && tag.entites && tag.entites.length) {
            wghRef.value?.showEntityByTag(tag.entites);
          } else {
            const list: any[] = [];
            getTagListBySpan(sheet.name(), row, col, list);
            if (list.length) {
              wghRef.value?.showEntityByTag(list);
            } else {
              wghRef.value?.clearAllLine();
              wghRef.value?.resetAllEntityColor();
              message.error(`未关联cad图纸`);
            }
          }
        } catch (error) {
          message.error(`联动定位失败`);
          console.log('联动定位失败:', error);
        }
      });
      // 切换sheet事件
      spread.bind(GC.Spread.Sheets.Events.ActiveSheetChanged, function (sender, args) {
        wghRef.value?.initSearchForm();
      });
    }
  };

  // 渲染Excel
  const renderExcel = (ejs: string = '') => {
    if (!spread) {
      spread = new GC.Spread.Sheets.Workbook(document.getElementById('excel_book_content'), {
        sheetCount: 1,
      });
    }
    if (ejs) {
      const arrayBuffer = base64ToArrayBuffer(ejs);
      const fileBlob = new Blob([arrayBuffer], {
        type: 'application/octet-stream',
      });
      spread.open(fileBlob, function () {
        assetCell.value = getCellByText(spread, assetColText);
        const sheetCount = spread.getSheetCount();
        for (let i = 0; i < sheetCount; i++) {
          const sheet = spread.getSheet(i);
          const defaultStyle = sheet.getDefaultStyle();
          defaultStyle.cellType = new HighlightTagCellType();
          sheet.setDefaultStyle(defaultStyle);
          setTimeout(() => {
            setCellDetailButton();
          }, 1000);
          setSearchOptions();
          wghRef.value.setInitEntityColor(
            tagList.map((item) => item.tag.entites.map((item) => item.handle)).flat(),
          );
        }
        message.success(`导入成功`);
      });
    } else {
      spread.destroy();
      spread = new GC.Spread.Sheets.Workbook(document.getElementById('excel_book_content'), {
        sheetCount: 1,
      });
    }
    bindSpreadEvent();
  };

  // 打开Excel文件
  const openExcelFile = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = false;
    input.accept = '.xlsx';
    input.onchange = function (e: any) {
      const file = e.target.files[0];
      const wb = GC.Spread.Sheets.findControl('excel_book_content');
      wb.import(file, () => {
        console.log('导入成功');
        assetCell.value = getCellByText(spread, assetColText);
      });
    };
    input.click();
  };

  // 渲染详情
  const renderDetail = (detail: any = {}) => {
    const { ejs = '', cadPath = '' } = detail;
    renderExcel(ejs);
    emits('update:mxFileUrl', cadPath);
  };

  // 监听是否显示Excel文件
  watch(
    () => props.isShowExcelFile,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (props.detialId) {
            message.loading({
              content: `加载中...`,
            });
            getCadDetail(props.detialId).then((res) => {
              renderDetail(res);
            });
          } else {
            emits('update:mxFileUrl', '');
            renderExcel();
          }
        });
      }
    },
    {
      immediate: true,
    },
  );

  // 暴露方法
  defineExpose({
    getData,
    getAllCellByValue,
  });
</script>
<style scoped lang="less">
  .cad-container {
    display: flex;
    flex-direction: row;
    height: 100%;
    flex: 1;
    gap: 20px;

    .excel-book__list {
      position: relative;
      width: 40%;
      border-right: 1px solid #bcbcbc;

      .excel-book__list-header {
        margin-bottom: 10px;
      }

      .excel-book__content {
        height: calc(100% - 42px);
        // height: 100%;
      }
    }

    .excel-book__cad {
      flex: 1;
    }

    .wgh-empty {
      flex: 1;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    .assets-list__container {
      position: absolute;
      bottom: 0;
      width: 100%;
      height: 300px;
      overflow: hidden;
      border: 1px solid #ebedf0;
      background: #fafafa;
      z-index: 1000;
    }
  }
</style>
