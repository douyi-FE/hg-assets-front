<template>
  <div class="cad-container">
    <div class="excel-book__list">
      <div class="excel-book__list-header">
        <a-button @click="openExcelFile">打开文件</a-button>
      </div>
      <div id="excel_book_content" class="excel-book__content" />
    </div>
    <wgh
      v-if="mxFileUrl !== ''"
      class="excel-book__cad"
      ref="wghRef"
      :mx-file-url="mxFileUrl"
      :detial-id="detialId"
      @getAllEntityV2="getAllEntityV2"
      @selectEntityChange="selectEntityChange"
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
        action="/api/api/filestorage/upload"
        :showUploadList="false"
        @change="handleChange"
      >
        <a-button>
          <upload-outlined />
          上传图纸
        </a-button>
      </a-upload>
    </a-empty>
  </div>
</template>

<script setup lang="ts">
  import { nextTick, ref, watch } from 'vue';
  import { UploadOutlined } from '@ant-design/icons-vue';
  import { nanoid } from 'nanoid';
  import { type UploadChangeParam, message } from 'ant-design-vue';
  import wgh from '../detail/wgh.vue';
  import { useUserStore } from '@/store/modules/user';
  import { getCadDetail } from '@/api/backend/api/cad';
  import { base64ToArrayBuffer } from '@/components/basic/ejs-design/resource/commonFunctions';

  const userStore = useUserStore();
  const token = userStore.token;

  const props = defineProps({
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
  const entityList = ref<any[]>([]);
  const selectedEntity = ref<any>(null);
  const fileList = ref<any[]>([]);

  const handleChange = (info: UploadChangeParam) => {
    const messageKey = nanoid();
    if (info.file.status !== 'uploading') {
      message.loading({
        content: `${info.file.name} 上传中...`,
        key: messageKey,
      });
    }
    if (info.file.status === 'done') {
      const { response } = info.file;
      if (response.code === 200) {
        emits('update:mxFileUrl', response.data.filename);
        message.success({
          content: `${info.file.name} 上传成功.`,
          key: messageKey,
        });
      } else {
        message.error({
          content: `${info.file.name} 上传失败.`,
          key: messageKey,
        });
      }
    } else if (info.file.status === 'error') {
      message.error({
        content: `${info.file.name} 上传失败.`,
        key: messageKey,
      });
    }
  };

  const getAllEntityV2 = (entryList: any[]) => {
    entityList.value = entryList;
  };

  const selectEntityChange = (entity: any) => {
    if (entity.objectName !== 'McDbText') {
      return;
    }

    selectedEntity.value = entity;
    console.log('selectedEntity', selectedEntity.value);
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
      spread.open(fileBlob, function () {});
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
    emits('update:mxFileUrl', cadPath);
  };

  watch(
    () => props.isShowExcelFile,
    (newVal) => {
      if (newVal) {
        nextTick(() => {
          if (props.detialId) {
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
      flex-basis: 40%;
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
