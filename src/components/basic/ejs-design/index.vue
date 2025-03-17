<template>
  <input id="selectedFile" type="file" name="files[]" accept=".xlsx" style="display: none" />
  <input id="uploadFileInput" type="file" style="display: none" multiple />
  <div id="ejs_design" class="ejs-design" ref="ejsDesign" />

  <!-- 附件列表模态框 -->
  <div id="fileListModal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog dialog">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
          <h4 class="modal-title">附件列表</h4>
        </div>
        <div class="modal-body">
          <button id="addFile" class="btn btn-primary">添加附件</button>
          <button id="downloadAll" class="btn btn-default">下载全部</button>
          <div id="fileListContainer" class="fileListContainer"></div>
        </div>
      </div>
    </div>
  </div>

  <!-- 文件预览模态框 -->
  <div id="filePreviewModal" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog dialog">
      <!-- 模态框大小、居中 -->
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">×</span>
          </button>
          <h4 class="modal-title">文件预览</h4>
        </div>
        <div class="modal-body">
          <div id="viewContainer" class="viewContainer"></div>
        </div>
      </div>
    </div>
  </div>
  <!-- 模态框依赖，必须放到 body 下方，否则无法初始化 -->
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { initDesigner } from './resource/initDesigner';
  import { store } from './store';
  import { getSpreadSJS, openTemplateByBase64 } from './resource/commonFunctions';
  import { initUploadFile } from './resource/fileUploadCellType';

  const ejsDesign = ref();

  const initSpread = () => {
    const designer = initDesigner('ejs_design');
    store.setDesigner(designer);
    store.setSpread((designer as any).getWorkbook());
  };

  // 组件挂载时
  onMounted(async () => {
    initSpread();
    initUploadFile();
  });

  defineExpose({
    setSJS: (base64: string, fileName: string, initDataSource: any = {}) => {
      openTemplateByBase64(base64, fileName).then(() => {
        if (Object.keys(initDataSource).length > 0) {
          const sheet = (store.spread as any).getActiveSheet();
          sheet.setDataSource(new GC.Spread.Sheets.Bindings.CellBindingSource(initDataSource));
        }
      });
    },
    getSpreadSJS: () => {
      return getSpreadSJS();
    },
  });
</script>

<style lang="less" scoped>
  .ejs-design {
    height: 100%;
    width: 100%;
  }
  .dialog {
    width: calc(100vw - 200px);
    max-width: 1200px;
  }

  .fileListContainer {
    height: calc(100vh - 300px);
    width: 100%;
    overflow: auto;
  }

  .viewContainer {
    height: calc(100vh - 200px);
    overflow: auto;
    text-align: center;
    margin: 0 auto;
  }
</style>
