<template>
  <a-modal v-model:open="isOpen" title="上传模板" @ok="handleOk">
    <a-form
      ref="formRef"
      :model="formState"
      layout="horizontal"
      :wrapper-col="{ span: 14 }"
      :label-col="{ style: { width: '100px' } }"
    >
      <a-form-item
        label="模板名称"
        name="name"
        :rules="[{ required: true, message: '请输入模板名称' }]"
      >
        <a-input v-model:value="formState.name" placeholder="请输入模板名称" />
      </a-form-item>
      <a-form-item label="上传模板" name="files">
        <a-upload
          :file-list="fileList"
          :before-upload="beforeUpload"
          :max-count="1"
          list-type="picture-card"
        >
          <div>
            <PlusOutlined />
            <div style="margin-top: 8px">上传模板</div>
          </div>
        </a-upload>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import type { UploadProps } from 'ant-design-vue';

  const emits = defineEmits(['saveUpload']);
  const formRef = ref();
  const isOpen = ref(false);
  const fileList = ref<UploadProps['fileList']>([]);
  const formState = ref<any>({
    name: '',
    file: undefined,
  });

  function openUpload() {
    isOpen.value = true;
  }

  const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    fileList.value = [...(fileList.value || []), file];
    formState.value.file = file;
    return true;
  };
  const handleOk = function () {
    formRef.value.validate().then((fields) => {
      emits('saveUpload', formState.value);
      isOpen.value = false;
    });
  };

  defineExpose({
    openUpload,
  });
</script>
