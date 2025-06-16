<template>
  <div class="cad-container">
    <div class="excel-book__list">
      <div class="excel-book__list-header">
        <a-space>
          <a-button @click="openExcelFile" type="primary">打开文件</a-button>
          <a-button @click="linkCad">关联cad</a-button>
          <a-button @click="unlinkCad">解除关联</a-button>
        </a-space>
      </div>
      <div id="excel_book_content" class="excel-book__content" />
    </div>
    <wgh
      v-if="mxFileUrl !== ''"
      class="excel-book__cad"
      ref="wghRef"
      :mx-file-url="mxFileUrl"
      :detial-id="detialId"
      :get-click-cell="getClickCell"
      @update:mx-file-url="updateMxFileUrl"
      @selectEntityChange="selectEntityChange"
      @clearCellTag="clearCellTag"
      @showCellByTag="showCellByTag"
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
  import { useUserStore } from '@/store/modules/user';
  import { getCadDetail } from '@/api/backend/api/cad';
  import { base64ToArrayBuffer } from '@/components/basic/ejs-design/resource/commonFunctions';

  const baseApiUrl = import.meta.env.VITE_BASE_API_URL;
  const userStore = useUserStore();
  const token = userStore.token;
  message.config({
    maxCount: 1,
  });

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

  let spread: any = null;
  const wghRef = ref<any>(null);
  const selectedEntity = ref<any>(null);
  const fileList = ref<any[]>([]);
  const cellDialogRef = ref<any>(null);
  const selectEntityHandles = ref<string[]>([]);

  const updateMxFileUrl = (url: string) => {
    emits('update:mxFileUrl', url);
  };

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

  const selectEntityChange = (entity: any) => {
    if (!entity.id) {
      return;
    }
    selectedEntity.value = entity;
  };

  const setCellTag = (tag: any, cell: { sheetName: string; row: number; col: number }) => {
    let sheet: any = null;
    if (cell.sheetName) {
      sheet = spread.getSheetFromName(cell.sheetName);
    } else {
      sheet = spread.getActiveSheet();
    }
    sheet.setTag(cell.row, cell.col, tag);
    sheet.repaint();
  };

  const showCellByTag = (tag: any) => {
    selectEntityHandles.value = [tag.handle];
    const cell = tagList.find((item) => {
      return item.tag
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

  const clearCellTag = () => {
    if (!spread) {
      return;
    }
    const sheet = spread.getActiveSheet();
    tagList.forEach((item) => {
      sheet.setTag(item.row, item.col, null);
      sheet.setStyle(item.row, item.col, null);
    });
    tagList.length = 0;
    sheet.repaint();
  };

  const getData = async function () {
    const excelEjs = await getExcelEjs();
    return {
      detailId: props.detialId,
      excelEjs,
      cadFileUrl: props.mxFileUrl,
    };
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
      });
    };
    input.click();
  };

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
    const tag = selectEntitys.map((item) => {
      return {
        id: item.id,
        handle: item.handle,
      };
    });
    sheet.setTag(row, col, tag);
    sheet.repaint();
    message.info(`关联成功`);
  };

  const unlinkCad = () => {
    const { col, row } = getClickCell() || {};
    if (!col || !row) {
      message.error('请先选择单元格');
      return;
    }
    const sheet = spread.getActiveSheet();
    sheet.setTag(row, col, null);
    sheet.setStyle(row, col, null);
    wghRef.value.clearAllLine();
    wghRef.value.resetAllEntityColor();
    message.info('解除关联成功');
  };

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
      cell.cellButtons([
        {
          caption: '详情',
          captionAlign: GC.Spread.Sheets.CaptionAlignment.right,
          imageType: GC.Spread.Sheets.ButtonImageType.collapse,
          visibility: GC.Spread.Sheets.ButtonVisibility.onSelected,
          command: (sheet, row, col, option) => {
            cellDialogRef.value.show(
              item,
              selectEntityHandles.value.length > 0
                ? selectEntityHandles.value
                : tag.map((item) => item.handle),
            );
          },
        },
      ]);
      sheet.repaint();
    });
  };

  // 绑定单元格点击事件
  const bindSpreadEvent = function () {
    if (spread !== null) {
      var spreadNS = GC.Spread.Sheets;
      spread.bind(spreadNS.Events.CellClick, function (e, args) {
        try {
          const { col, row } = args;
          const sheet = spread.getActiveSheet();
          const tag = sheet.getTag(row, col);
          if (tag && tag.length) {
            wghRef.value.showEntityById(tag);
          } else {
            const tagList: any[] = [];
            let span = sheet.getSpan(row, col);
            function getTagListBySpan(span) {
              if (span) {
                let nextCol = span.col + span.colCount;
                for (let spanRow = span.row; spanRow < span.row + span.rowCount; spanRow++) {
                  const tag = sheet.getTag(spanRow, nextCol);
                  if (tag && tag.length) {
                    tagList.push(...(Array.isArray(tag) ? tag : [tag]));
                  }
                  const nextSpan = sheet.getSpan(spanRow, nextCol);
                  getTagListBySpan(nextSpan);
                }
              }
            }
            getTagListBySpan(span);
            if (tagList.length) {
              wghRef.value.showEntityById(tagList);
            } else {
              wghRef.value.clearAllLine();
              wghRef.value.resetAllEntityColor();
              message.error(`未关联cad图纸`);
            }
          }
        } catch (error) {
          message.error(`联动定位失败`);
          console.log('联动定位失败:', error);
        }
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
        const sheetCount = spread.getSheetCount();
        for (let i = 0; i < sheetCount; i++) {
          const sheet = spread.getSheet(i);
          const defaultStyle = sheet.getDefaultStyle();
          defaultStyle.cellType = new HighlightTagCellType();
          sheet.setDefaultStyle(defaultStyle);
          setTimeout(() => {
            setCellDetailButton();
          }, 1000);
        }
        message.success(`导入成功`);
      });
    } else {
      spread.destroy();
      spread = new GC.Spread.Sheets.Workbook(document.getElementById('excel_book_content'), {
        sheetCount: 1,
      });
    }
  };

  const renderDetail = (detail: any = {}) => {
    const { ejs = '', cadPath = '' } = detail;
    renderExcel(ejs);
    bindSpreadEvent();
    emits('update:mxFileUrl', cadPath);
  };

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

  defineExpose({
    getData,
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
      width: 40%;
      border-right: 1px solid #bcbcbc;

      .excel-book__list-header {
        margin-bottom: 10px;
      }

      .excel-book__content {
        height: 100%;
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
  }
</style>
