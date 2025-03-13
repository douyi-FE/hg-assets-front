<!-- eslint-disable vue/no-mutating-props -->
<!-- 项目信息 -->

<template>
  <a-row :gutter="24" justify="start">
    <a-col :span="12">
      <a-form-item ref="code" label="申请编号：" name="code" required>
        <a-input v-model:value="formState.code" disabled />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="项目名称" name="name">
        <a-select v-model:value="formState.name" placeholder="请选择项目名称">
          <a-select-option
            v-for="item in invoiceStore.projectList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="项目承接主管" name="manager">
        <a-input v-model:value="formState.manager" disabled />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="业务类型" name="businessType">
        <a-input v-model:value="formState.businessType" disabled />
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="所属部门" name="department">
        <a-input v-model:value="formState.department" disabled /> </a-form-item
    ></a-col>
    <a-col :span="12">
      <a-form-item label="所属分支机构" name="date1">
        <a-input v-model:value="formState.branch" /> </a-form-item
    ></a-col>
    <a-col :span="12">
      <a-form-item label="核算方法" name="contractType" required>
        <a-select v-model:value="formState.contractType" placeholder="请选择核算方法">
          <a-select-option
            v-for="item in invoiceStore.invoiceContractType"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item></a-col
    >
    <a-col :span="12">
      <a-form-item label="合同编号" name="contractCode" required>
        <a-select v-model:value="formState.contractCode" placeholder="请选择合同编号">
          <a-select-option
            v-for="item in invoiceStore.contractList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item></a-col
    >
    <a-col :span="12">
      <a-form-item label="合同名称" name="contractName">
        <a-input v-model:value="formState.contractName" disabled /> </a-form-item
    ></a-col>
    <a-col :span="12">
      <a-form-item label="开票机构" name="anency" required>
        <a-select v-model:value="formState.anency" placeholder="请选择开票机构">
          <a-select-option
            v-for="item in invoiceStore.invoiceOrgList"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="开票费用类别" name="invoiceFeeType" required>
        <a-select v-model:value="formState.invoiceFeeType" placeholder="请选择开票费用类别">
          <a-select-option
            v-for="item in invoiceStore.invoiceFeeType"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="支付方式" name="invoicePayType" required>
        <a-select v-model:value="formState.invoicePayType" placeholder="请选择支付方式">
          <a-select-option
            v-for="item in invoiceStore.invoicePayType"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <a-form-item label="付款申请附件" name="paymentApplicationAttachments">
        <a-upload
          name="paymentApplicationAttachments"
          :multiple="true"
          :with-credentials="true"
          :show-upload-list="true"
          :before-upload="(file) => beforeUpload()"
          :file-list="paymentApplicationAttachmentsList"
          @change="(info) => uploadChange(info, 'paymentApplicationAttachments')"
        >
          <a-button type="primary"> 选择文件 </a-button>
        </a-upload>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <!-- 付款汇总明细表附件 -->
      <a-form-item label="付款汇总明细表附件" name="invoiceSummaryAttachment">
        <a-upload
          name="invoiceSummaryAttachment"
          :multiple="true"
          :with-credentials="true"
          :show-upload-list="true"
          :before-upload="(file) => beforeUpload()"
          :file-list="invoiceSummaryAttachmentList"
          @change="(info) => uploadChange(info, 'invoiceSummaryAttachment')"
        >
          <a-button type="primary"> 选择文件 </a-button>
        </a-upload>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <!-- 验收证书附件  -->
      <a-form-item label="验收证书附件" name="invoiceAcceptanceAttachment">
        <a-upload
          name="invoiceAcceptanceAttachment"
          :multiple="true"
          :with-credentials="true"
          :show-upload-list="true"
          :before-upload="(file) => beforeUpload()"
          :file-list="invoiceAcceptanceAttachmentList"
          @change="(info) => uploadChange(info, 'invoiceAcceptanceAttachment')"
        >
          <a-button type="primary"> 选择文件 </a-button>
        </a-upload>
      </a-form-item>
    </a-col>
    <a-col :span="12">
      <!-- 其它附件 -->
      <a-form-item label="其它附件" name="invoiceOtherAttachment">
        <a-upload
          name="invoiceOtherAttachment"
          :multiple="true"
          :with-credentials="true"
          :show-upload-list="true"
          :before-upload="(file) => beforeUpload()"
          :file-list="invoiceOtherAttachmentList"
          @change="(info) => uploadChange(info, 'invoiceOtherAttachment')"
        >
          <a-button type="primary"> 选择文件 </a-button>
        </a-upload>
      </a-form-item>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
  import { onMounted, ref, toRaw, watch } from 'vue';
  import { message, type UploadChangeParam, type UploadProps } from 'ant-design-vue';
  import { useInvoiceStore } from '@/store/modules/invioce';
  import { useUserStore } from '@/store/modules/user';
  import api from '@/api/backend/api';
  import { deleteFileStorage, uploadFileStorage } from '@/api/backend/api/fileStorage';

  const userStore = useUserStore();
  const invoiceStore = useInvoiceStore();
  let errUploadFileList: any[] = [];
  const invoiceOtherAttachmentList = ref<UploadProps['fileList']>([]);
  const invoiceAcceptanceAttachmentList = ref<UploadProps['fileList']>([]);
  const invoiceSummaryAttachmentList = ref<UploadProps['fileList']>([]);
  const paymentApplicationAttachmentsList = ref<UploadProps['fileList']>([]);

  const props = defineProps<{
    formState: any;
  }>();
  const emit = defineEmits<{
    (e: 'update:formState', value: any): void;
  }>();

  const beforeUpload = () => {
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
  const uploadChange = (info: UploadChangeParam, type: string) => {
    const file: any = info.file;
    const attachmentList = {
      paymentApplicationAttachments: paymentApplicationAttachmentsList,
      invoiceSummaryAttachment: invoiceSummaryAttachmentList,
      invoiceAcceptanceAttachment: invoiceAcceptanceAttachmentList,
      invoiceOtherAttachment: invoiceOtherAttachmentList,
    }[type];
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
            [type]: resFileList.map((file) => ({
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
          attachmentList!.value = resFileList.map((file) => toRaw(file));
          errUploadFileList = resFileList.filter((file) => file.status === 'error');
        });
    }
    // 不存在则是删除
    else {
      fileRequest = deleteFileStorage(file.url)
        .then(() => {
          emit('update:formState', {
            ...props.formState,
            [type]: resFileList.map((file) => ({
              id: file.uid,
              name: file.name,
              url: file.url,
              status: 'done',
            })),
          });
          attachmentList!.value = resFileList.map((file) => toRaw(file));
        })
        .catch(() => {
          if (errUploadFileList.find((item) => item.uid === file.uid)) {
            attachmentList!.value =
              attachmentList!.value?.filter((item) => item.uid !== file.uid) || [];
          } else {
            message.error('删除失败');
          }
        });
    }
  };

  watch(
    () => props.formState.name,
    (val) => {
      emit('update:formState', {
        ...props.formState,
        businessType: invoiceStore.projectList.find((item) => item.label === val)?.type,
        manager: invoiceStore.projectList.find((item) => item.label === val)?.manager,
      });
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.formState.contractCode,
    (val) => {
      emit('update:formState', {
        ...props.formState,
        contractName: invoiceStore.contractList.find((item) => item.value === val)?.name,
      });
    },
  );

  onMounted(() => {
    api.systemUser.userRead({ id: userStore.userInfo.id || 0 }).then((res) => {
      const { dept } = res;
      emit('update:formState', {
        ...props.formState,
        department: dept.name,
      });
    });
  });
</script>
