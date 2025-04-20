<template>
  <a-form ref="formRef" :model="form" :rules="rules" layout="vertical">
    <!-- 员工信息 -->
    <a-form-item label="员工信息" name="employeeName" required>
      <a-input v-model:value="form.employeeName" disabled />
    </a-form-item>
    <!-- 员工id -->
    <a-form-item label="员工id" name="employeeId" required hidden>
      <a-input v-model:value="form.employeeId" disabled />
    </a-form-item>
    <!-- 休假类型 -->
    <a-form-item label="休假类型" name="leaveType" required>
      <a-select v-model:value="form.leaveType">
        <a-select-option value="annual">年假</a-select-option>
        <a-select-option value="sick">病假</a-select-option>
        <a-select-option value="personal">事假</a-select-option>
      </a-select>
    </a-form-item>

    <!-- 时间选择 -->
    <a-row :gutter="16">
      <a-col :span="12">
        <a-form-item label="开始时间" required>
          <a-date-picker v-model:value="form.startDate" show-time style="width: 100%" />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="结束时间" required>
          <a-date-picker v-model:value="form.endDate" show-time style="width: 100%" />
        </a-form-item>
      </a-col>
    </a-row>

    <!-- 请假原因 -->
    <a-form-item label="请假原因" name="reason" required>
      <a-textarea v-model:value="form.reason" :rows="4" placeholder="请详细说明请假原因" />
    </a-form-item>

    <!-- 附件上传 -->
    <a-form-item label="相关附件" name="attachments">
      <a-upload
        name="leaveAttachment"
        :multiple="true"
        :with-credentials="true"
        :show-upload-list="true"
        :file-list="form.attachments"
        :before-upload="(file) => beforeUpload(file, 'leaveAttachment')"
        @change="uploadChange"
      >
        <a-button> 选择文件 </a-button>
      </a-upload>
    </a-form-item>

    <!-- 提交按钮 -->
    <a-form-item>
      <a-button type="primary" @click="submitForm"> 提交申请 </a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { message, type UploadChangeParam } from 'ant-design-vue';
  import { useUserStore } from '@/store/modules/user';
  import { uploadFileStorage } from '@/api/backend/api/fileStorage';
  import { createLeave } from '@/api/backend/api/leave';

  const emits = defineEmits(['createSuccess']);

  const userInfo = useUserStore();
  const formRef = ref<any>();
  const form = ref({
    employeeName: userInfo.userInfo.nickname,
    employeeId: userInfo.userInfo.id,
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    attachments: [],
  });

  const rules = {
    leaveType: [{ required: true, message: '请选择休假类型' }],
    startDate: [{ required: true, message: '请选择开始时间' }],
    endDate: [{ required: true, message: '请选择结束时间' }],
    reason: [{ required: true, message: '请填写请假原因' }],
  };

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
    console.log('info', info);
    const file: any = info.file;
    uploadFile(file).then((filename) => {
      (form.value.attachments as any[]).push({
        id: file.uid,
        name: file.name,
        url: filename,
      });
    });
  };

  const submitForm = () => {
    formRef.value.validate().then((res) => {
      console.log('res', res);
      createLeave(form.value).then((res) => {
        message.success('提交成功');
        emits('createSuccess');
      });
    });
  };
</script>
