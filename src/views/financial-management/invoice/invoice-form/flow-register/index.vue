<!-- eslint-disable vue/no-mutating-props -->
<!-- 流程登记 -->

<template>
  <a-row :gutter="24" justify="start">
    <a-col :span="12">
      <a-form-item ref="code" label="取票方式" name="invoiceTicketType" required>
        <a-select v-model:value="formState.invoiceTicketType" placeholder="请选择取票方式">
          <a-select-option
            v-for="item in invoiceStore.invoiceTicketType"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="说明" name="invoiceDescription">
        <a-textarea v-model:value="formState.invoiceDescription" />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="附件" name="invoiceAttachment">
        <a-upload
          name="invoiceAttachment"
          :multiple="true"
          :with-credentials="true"
          :show-upload-list="true"
          :before-upload="(file) => beforeUpload(file, 'invoiceAttachment')"
          :file-list="invoiceAttachmentList"
          @change="uploadChange"
        >
          <a-button type="primary"> 选择文件 </a-button>
        </a-upload>
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import { ref, toRaw } from 'vue';
  import { message, type UploadChangeParam, type UploadProps } from 'ant-design-vue';
  import { useInvoiceStore } from '@/store/modules/invioce';
  import { deleteFileStorage, uploadFileStorage } from '@/api/backend/api/fileStorage';

  const props = defineProps<{
    formState: any;
  }>();

  const invoiceStore = useInvoiceStore();
  const invoiceAttachmentList = ref<UploadProps['fileList']>(props.formState.invoiceAttachment);
  let errUploadFileList: any[] = [];

  const emit = defineEmits<{
    (e: 'update:formState', value: any): void;
  }>();
  const beforeUpload = (file: any, type: string) => {
    return false;
  };
  // 上传文件
  const uploadFile = (file: any) => {
    return uploadFileStorage(
      {
        file: file,
      },
      file,
    ).then((res) => {
      return res.filename;
    });
  };
  const uploadChange = (info: UploadChangeParam) => {
    const file: any = info.file;
    let resFileList = [...info.fileList];
    const matchFile = resFileList.find((item) => item.uid === file.uid);
    let fileRequest = Promise.resolve();
    // 存在则是上传
    if (matchFile) {
      fileRequest = uploadFile(file)
        .then((filename) => {
          matchFile.url = filename;
          emit('update:formState', {
            ...props.formState,
            invoiceAttachment: resFileList.map((file) => ({
              id: file.uid,
              name: file.name,
              url: file.url,
              status: 'done',
            })),
          });
        })
        .catch(() => {
          message.error('上传失败');
          const matchFile = resFileList.find((item) => item.uid === file.uid);
          if (matchFile) {
            matchFile.status = 'error';
          }
        })
        .finally(() => {
          invoiceAttachmentList.value = resFileList.map((file) => toRaw(file));
          errUploadFileList = resFileList.filter((file) => file.status === 'error');
        });
    }
    // 不存在则是删除
    else {
      fileRequest = deleteFileStorage(file.url)
        .then(() => {
          emit('update:formState', {
            ...props.formState,
            invoiceAttachment: resFileList.map((file) => ({
              id: file.uid,
              name: file.name,
              url: file.url,
              status: 'done',
            })),
          });
          invoiceAttachmentList.value = resFileList.map((file) => toRaw(file));
        })
        .catch(() => {
          if (errUploadFileList.find((item) => item.uid === file.uid)) {
            invoiceAttachmentList.value =
              invoiceAttachmentList.value?.filter((item) => item.uid !== file.uid) || [];
          } else {
            message.error('删除失败');
          }
        });
    }
  };
</script>
