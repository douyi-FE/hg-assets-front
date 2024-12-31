<template>
  <a-modal v-model:open="isOpen" title="上传模板" @ok="handleOk" @cancel="resetForm">
    <a-form
      ref="formRef"
      :model="formState"
      layout="horizontal"
      :wrapper-col="{ span: 14 }"
      :label-col="{ style: { width: '100px' } }"
    >
      <!-- 表单项 -->
      <a-form-item
        label="模板名称"
        name="name"
        :rules="[{ required: true, message: '请输入模板名称' }]"
      >
        <a-input v-model:value="formState.name" placeholder="请输入模板名称" />
      </a-form-item>
      <a-form-item
        label="模板编码"
        name="code"
        :required="true"
        :rules="[{ required: true, message: '请输入模板编码' }]"
      >
        <a-input v-model:value="formState.code" placeholder="请输入模板编码" />
      </a-form-item>
      <a-form-item label="是否内置" name="isBuildIn">
        <!-- :disabled="$auth('template:excel:buildin') && isPermissionDisabledByCode()" -->
        <a-radio-group
          v-model:value="formState.isBuildIn"
          v-bind:disabled="formState.isBuildIn === true"
        >
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="发布状态" name="status">
        <a-radio-group v-model:value="formState.status">
          <a-radio :value="0">草稿</a-radio>
          <a-radio :value="1">待发布</a-radio>
          <a-radio :value="2">已发布</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="模板描述" name="note">
        <a-textarea v-model:value="formState.note" placeholder="请输入模板描述" />
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
  import { ref, watch } from 'vue';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import type { UploadProps } from 'ant-design-vue';

  const emits = defineEmits(['saveUpload']);
  const formRef = ref();
  const isOpen = ref(false);
  const fileList = ref<UploadProps['fileList']>([]);
  const formState = ref<any>({
    name: '',
    code: '',
    isBuildIn: false,
    status: 0,
    note: '',
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

  watch(isOpen, (curIsOpen) => {
    if (curIsOpen === false) {
      formRef.value.resetFields();
      fileList.value = [];
    }
  });

  const resetForm = function () {
    formRef.value.resetFields();
    fileList.value = [];
  };

  defineExpose({
    openUpload,
  });
</script>
